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

export interface FileOrFolder {
    type: 'file' | 'folder';
    name: string;
    content?: string;
    children?: FileOrFolder[];
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

export async function generateFileStructure(details: ProjectDetails): Promise<FileOrFolder[]> {
    const apiKey = key();
    const prompt = fileStructurePrompt(details);
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
        const parsedJson = JSON.parse(responseText);
        const structure: FileOrFolder[] = parsedJson.projectStructure;
        if (!structure || !Array.isArray(structure)) {
             throw new Error("Response JSON is missing the 'projectStructure' array.");
        }
        return structure;
    } catch (error) {
        throw new Error("The response from the Gemini API was not valid JSON or did not match the expected format.");
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

const fileStructurePrompt = (details: ProjectDetails): string => (
`You are an expert software architect and project scaffolding assistant. Your task is to generate a complete and optimal file structure along with functional boilerplate code for a new software project based on the provided details.

**Project Name:** \`${details.name}\`
**Project Description:** \`${details.desc}\`
**Tech Stack:** \`${details.techStack.join(', ')}\`

**Instructions:**
1. Analyze the project requirements and the specified tech stack.
2. Create a logical directory structure that follows industry best practices.
3. Include all necessary configuration files (e.g., \`package.json\`, \`.gitignore\`, \`tsconfig.json\`, \`vite.config.ts\`).
4. Provide clean, well-commented, and runnable boilerplate code for the entry-point files and at least one example component.
5. Your entire response **MUST** be a single, valid JSON object. The root of this object should contain one key, \`"projectStructure"\`, which holds an array of file and folder objects.

**JSON Object Schema:**
* Each object in the array represents a file or a folder.
* An object must have a \`type\` property, which is either \`"file"\` or \`"folder"\`.
* An object must have a \`name\` property (e.g., \`"src"\`, \`"index.js"\`).
* If \`type\` is \`"file"\`, it must have a \`content\` property containing the boilerplate code as a string.
* If \`type\` is \`"folder"\`, it must have a \`children\` property, which is an array of more file/folder objects.
`
);