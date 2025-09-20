import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GitDiffData } from './gitUtils';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface RefinedCode {
    name:string;
    desc: string;
    code: string;
}

export interface ProjectDetails {
    name: string;
    desc: string;
    techStack: string[];
}

export interface FlatFile {
    fullPath: string;
    content: string;
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
    if (files.length === 0) {
        throw new Error('No files provided for refinement.');
    }
    const prompt = codeRefinementPrompt(files);
    const response = await fetch(GEMINI_URL, {
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
    if (files.length === 0) {
        throw new Error('No files provided to generate a commit message.');
    }
    const prompt = conventionalCommitPrompt(files);
    const response = await fetch(GEMINI_URL, {
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

    return text.trim();
}

export async function generateFileStructure(details: ProjectDetails): Promise<FlatFile[]> {
    const apiKey = key();
    const prompt = fileListPrompt(details);
    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 8192,
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

    return responseText
        .trim()
        .split('\n')
        .map((line: string) => {
            const [fullPath, ...contentParts] = line.split(':::');
            let content = contentParts.join(':::');
            
            // --- ADD THIS LINE ---
            // Replace the <NEWLINE> token with the actual newline character.
            content = content.replace(/<NEWLINE>/g, '\n');

            return { fullPath: fullPath.trim(), content: content.trim() };
        })
        .filter((file: { fullPath: string, content: string }) => file.fullPath);  
}

const fileListPrompt = (details: ProjectDetails): string => (
`You are a project scaffolding assistant. Your task is to generate the full contents of all files for a new software project.

Project Name: ${details.name}
Project Description: ${details.desc}
Tech Stack: ${details.techStack.join(', ')}

**RESPONSE INSTRUCTIONS:**
1.  Generate a list of all necessary files.
2.  Each line in your response must represent one file.
3.  Each line **MUST** be in the format: \`filePath:::fileContent\`.
4.  **CRITICAL**: For multi-line file content, you **MUST** replace every newline character with the special token "<NEWLINE>".
5.  Do **NOT** respond in JSON format. Respond in the custom plain text format described.
6.  For \`package.json\`, provide a valid JSON object as the content.

**EXAMPLE:**
./src/index.js:::import React from 'react';<NEWLINE>console.log("Hello, World!");
./package.json:::{ "name": "${details.name}", "version": "1.0.0" }
`
);

const codeRefinementPrompt = (files: GitDiffData[]):string => (
`
You are an expert code reviewer and senior software engineer. Your task is to analyze code changes, understand the developer's intent, and provide a refined, more efficient, and robust version of the code. You must also provide a concise, high-level description of what each file does.

Analyze the following array of file data. For each file, use the 'diff' to understand the intended changes and then refine the entire 'code' to be more efficient, robust, and aligned with best practices.

Constraints:
1. The refined code should achieve the same goal as the original intent but with better implementation.
2. The refined code should have minimal comments.
3. The description ('desc') should be a high-level summary of the file's purpose and usage, not a line-by-line explanation.

Your response MUST be a valid JSON array of objects, where each object contains the following keys: "name", "desc", and "code".

Input Data:
\`\`\`json
${JSON.stringify(files, null, 2)}
\`\`\`
`
);

const conventionalCommitPrompt = (files: GitDiffData[]): string => (
`
You are an expert at writing concise and informative git commit messages. Analyze the following git diffs and generate a single, conventional commit message that summarizes all the changes.

Constraints:
- The message must follow the Conventional Commits specification.
- The format must be <type>(<scope>): <subject>.
- The <scope> should be a short word describing the area of the codebase affected (e.g., 'api', 'ui', 'utils').
- The entire message must be less than 20 words.
- Do not include a body or footer.
- Your response must be only the commit message string, with no extra text or markdown.

Here are the diffs:
\`\`\`json
${JSON.stringify(files.map(f => ({ name: f.name, diff: f.diff })), null, 2)}
\`\`\`
`
);