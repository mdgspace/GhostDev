import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';
import { GitDiffData } from './gitUtils';
import { parse } from 'jsonc-parser';
import { fetchRepoPersona } from './githubUtils';
import { getCustomPrompt } from './promptUtils';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let projectPersona: any;
export let setProjectPersona = (persona: any) => {
    projectPersona = persona
}
export interface RefinedCode {
    name:string;
    desc: string;
    code: string;
}

export interface ProjectDetails {
    name: string;
    desc: string;
    techStack: string[];
    refRepos: string[];
}

let url = () => {
    const geminiUrl = process.env.GEMINI_URL
    if(!geminiUrl) {
        throw new Error('Gemini URL not set in .env file')
    }
    return geminiUrl;
}

let key = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not set in .env file');
    }
    return apiKey;
}

export async function getCodeRefinements(files: GitDiffData[]): Promise<RefinedCode[]> {
    const apiKey = key();
    const geminiUrl = url();
    if (files.length === 0) {
        throw new Error('No files provided for refinement.');
    }
    const prompt = await codeRefinementPrompt(files);
    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json() as any;
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
        throw new Error('No valid content found in Gemini API response.');
    }
    try {
        const refinedData: RefinedCode[] = JSON.parse(responseText);
        return refinedData;
    } catch (error) {
        throw new Error("The response from the Gemini API was not valid JSON.");
    }
}

export async function suggestComment(files: GitDiffData[]): Promise<string> {
    const apiKey = key();
    const geminiUrl = url();
    if (files.length === 0) {
        throw new Error('No files provided to generate a commit message.');
    }
    const prompt = await conventionalCommitPrompt(files);
    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json() as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No valid content found in Gemini API response.');
    }

    return text.trim();
}

export async function generateFileStructure(projectDetails: ProjectDetails): Promise<any> {
    const apiKey = key();
    const geminiUrl = url();

    const persona = await fetchRepoPersona(projectDetails.refRepos) as any;

    const prompt = await generateFileStructurePrompt(projectDetails, JSON.stringify(persona));

    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json() as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No valid content found in Gemini API response.');
    }

    const errors: any[] = [];
    const parsedJson = parse(text, errors);

    if (errors.length > 0) {
        console.warn("JSONC parser encountered recoverable errors:", errors);
    }

    if (parsedJson === undefined) {
        throw new Error("Failed to parse the JSON structure from the API response.");
    }

    return parsedJson;
}

async function generateFileStructurePrompt(details: ProjectDetails, persona: string): Promise<string> {
    //Fetch the custom prompt template from .ghostdev/prompts.json or get the default.
    const promptTemplate = await getCustomPrompt('generateFileStructure');

    const finalPrompt = promptTemplate
        .replace('{{projectName}}', details.name)
        .replace('{{projectDescription}}', details.desc)
        .replace('{{techStack}}', details.techStack.join(', '))
        .replace('{{persona}}', persona);

    return finalPrompt;
}

async function codeRefinementPrompt(files: GitDiffData[]): Promise<string> {
	const promptTemplate = await getCustomPrompt('getCodeRefinements');
	
	const personaString = projectPersona ? JSON.stringify(projectPersona, null, 2) : "{}";
	// Ensure files is an array before mapping
	const filesArray = Array.isArray(files) ? files : [];
	const filesJson = JSON.stringify(filesArray, null, 2);

	const finalPrompt = promptTemplate
		.replace('{{persona}}', personaString)
		.replace('{{diffDataAsJson}}', filesJson);
	
	return finalPrompt;
}

async function conventionalCommitPrompt(files: GitDiffData[]): Promise<string> {
    if (!Array.isArray(files)) {
        console.error("conventionalCommitPrompt Error: The input 'files' is not an array. Received:", files);
        throw new TypeError("Input to conventionalCommitPrompt must be an array.");
    }

    const promptTemplate = await getCustomPrompt('suggestComment');

    const filesForJson = [];

    for (const file of files) {
        filesForJson.push({ 
            name: file.name, 
            diff: file.diff 
        });
    }

    const diffAsJson = JSON.stringify(filesForJson, null, 2);

    const finalPrompt = promptTemplate.replace('{{diffDataAsJson}}', diffAsJson);

    return finalPrompt;
}