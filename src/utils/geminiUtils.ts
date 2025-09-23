import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GitDiffData } from './gitUtils';
import { parse } from 'jsonc-parser';
import { fetchRepoPersona } from './githubUtils';

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
    const prompt = codeRefinementPrompt(files);
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
    const prompt = conventionalCommitPrompt(files);
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

    return text.trim();
}

export async function generateFileStructure(projectDetails: ProjectDetails): Promise<any> {
    const apiKey = key();
    const geminiUrl = url();

    const persona = await fetchRepoPersona(projectDetails.refRepos) as any;

    const prompt = generateFileStructurePrompt(projectDetails, JSON.stringify(persona));

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

const generateFileStructurePrompt = (details: ProjectDetails, persona: string): string => (
`You are an automated file structure generation service. Your sole purpose is to output a raw JSON object that represents the complete file and directory structure for a new software project, including placeholder code content for key files.

## Project Details
- **Project Name:** ${details.name}
- **Project Description:** ${details.desc}
- **Tech Stack:** ${details.techStack.join(', ')}

## User Persona & Coding Style
The following JSON object describes the user's established coding style and conventions. All generated file names, directory structures, and placeholder code **must** strictly adhere to these rules.

**Instructions for applying the persona:**
- **File Naming:** Use the naming convention specified in the persona (e.g., kebab-case, camelCase).
- **Code Style:** All generated code snippets must match the user's indentation, string quotation preference, and other coding style rules.
- **Directory Structure:** Organize the source layout according to the user's preferred pattern (e.g., feature-based).

**Persona Data:**
${persona}

## Response Format Instructions
Generate a JSON object representing the project's file structure.
-   Keys must be strings representing file or directory names that conform to the user persona.
-   Values for files must be strings containing plausible source code or content, written in the user's preferred style.
-   Values for directories must be nested JSON objects following the same rules.

### CRITICAL RULES FOR OUTPUT
1.  **JSON ONLY:** Your entire response must be a single, raw JSON object.
2.  **NO MARKDOWN:** Do not wrap the JSON in markdown code blocks like \`\`\`json.
3.  **NO EXTRA TEXT:** Do not include ANY text, headers, footers, explanations, or conversational filler before or after the JSON object. Your response must start with { and end with }.
`
);

const codeRefinementPrompt = (files: GitDiffData[]):string => (
`You are an expert AI code reviewer, acting as a senior software engineer. Your purpose is to meticulously analyze code changes, deduce the developer's intent, and then produce a refined, production-ready version of the code. You will also provide a concise, high-level summary of each file's role.
## Your Task
For each file in the input array, perform the following steps:
Understand the Change: Analyze the diff to understand the developer's specific intent.
Apply and Refine: First, mentally apply the intended changes from the diff to the original code. Then, refine the entire resulting file to improve its efficiency, readability, robustness, and adherence to modern best practices.
Describe the File: Write a high-level summary (desc) explaining the file's primary purpose and how it's used within a larger project.
## Project Context
Tech Stack/Framework: [Specify a tech stack, e.g., TypeScript, React, Node.js, Express]
Coding Standards: [Specify a standard, e.g., Airbnb Style Guide, StandardJS]
## Constraints & Formatting Rules
Refinement: The refined code must achieve the same goal as the developer's intent but with superior implementation (e.g., using better algorithms, idiomatic language features, or improved error handling).
Documentation: Adhere to modern documentation standards (e.g., JSDoc/TSDoc for functions). Add inline comments only for complex or non-obvious logic. Avoid redundant comments.
Description: The desc must be a high-level summary, not a line-by-line explanation. Keep it under 40 words.
Strict JSON Output: Your entire response MUST be a single, raw JSON array of objects.
Do not wrap the JSON in markdown blocks (e.g., \`\`\`json).
Do not include any introductory text, explanations, or conversational filler.
Your response must start with [ and end with ].
## Example
Input Data Example:
JSON
[
  {
    "name": "utils/format.js",
    "code": "function transformToUpperCase(arr) { var result = []; for (var i = 0; i < arr.length; i++) { result.push(arr[i].toUpperCase()); } return result; }",
    "diff": "--- a/utils/format.js\n+++ b/utils/format.js\n@@ -1,1 +1,1 @@\n-function transformToUpperCase(arr) { var result = []; for (var i = 0; i < arr.length; i++) { result.push(arr[i].toUpperCase()); } return result; }\n+const transformToUpperCase = (arr) => { let result = []; for (let i = 0; i < arr.length; i++) { result.push(arr[i].toUpperCase()); } return result; }"
  }
]
Expected Output Example:
JSON
[
  {
    "name": "utils/format.js",
    "desc": "A utility module that provides helper functions for string transformations, such as converting an array of strings to uppercase.",
    "code": "/**\n * Transforms an array of strings to uppercase.\n * @param {string[]} arr The input array of strings.\n * @returns {string[]} The new array with uppercase strings.\n */\nexport const transformToUpperCase = (arr) => arr.map(item => item.toUpperCase());"
  }
]
## Final Prompt for API Call
(Provide the actual input data below this line)
Persona Data:
${projectPersona? JSON.stringify(projectPersona): ""}
Input Data:
\`\`\`json
${JSON.stringify(files, null, 2)}
\`\`\`
`
);

const conventionalCommitPrompt = (files: GitDiffData[]): string => (
`
You are an expert AI assistant that writes concise, conventional git commit messages. Your task is to analyze a set of git diffs, determine the overarching intent of the changes, and generate a single, high-quality commit message that summarizes them.
## Your Task
Analyze Intent: First, determine the primary goal that unifies all the changes. Are they fixing a bug, adding a new feature, or refactoring code?
Determine Type & Scope: Based on the intent and the file paths, select the most appropriate commit type and scope.
Craft Subject: Write a concise subject line that describes the change in the imperative mood (e.g., "add," "fix," "update," not "added," "fixes," or "updates").
## Conventional Commit Rule
Format: Your message must strictly follow the <type>(<scope>): <subject> format.
Type: Choose the <type> from this list: feat, fix, chore, refactor, docs, style, test, build, ci, perf.
Scope: Infer a logical, singular <scope> from the affected file paths (e.g., api, auth, ui, payment). The scope is optional if the changes are widespread and defy a single descriptor.
Subject:
Keep the subject line under 50 characters.
Start with a lowercase letter.
Do not end the subject with a period.
## Example
Input Diffs Example:
JSON
[
  {
    "name": "src/components/UserProfile.js",
    "diff": "--- a/src/components/UserProfile.js\n+++ b/src/components/UserProfile.js\n@@ -10,1 +10,1 @@\n-    <p>Loading...</p>\n+    <p>Loading user data...</p>"
  },
  {
    "name": "src/api/users.js",
    "diff": "--- a/src/api/users.js\n+++ b/src/api/users.js\n@@ -5,3 +5,4 @@\n-  // TODO: Add error handling\n+  if (!response.ok) {\n+    throw new Error('Failed to fetch user');\n+  }"
  }
]
Expected Output Example:
fix(api): add error handling to user fetch
## Strict Output Format
Your response MUST be only the commit message string.
Do not include any extra text, explanations, or markdown formatting.
## Final Prompt for API Call
(Provide the actual input data below this line)
Input Diffs:
\`\`\`json
${JSON.stringify(files.map(f => ({ name: f.name, diff: f.diff })), null, 2)}
\`\`\`
`
);