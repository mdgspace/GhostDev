import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GitDiffData } from './gitUtils';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface RefinedCode {
    name:string;
    desc: string;
    code: string;
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
)