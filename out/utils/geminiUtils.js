"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileStructure = exports.suggestComment = exports.getCodeRefinements = exports.setProjectPersona = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const jsonc_parser_1 = require("jsonc-parser");
const githubUtils_1 = require("./githubUtils");
const promptUtils_1 = require("./promptUtils");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
let projectPersona;
let setProjectPersona = (persona) => {
    projectPersona = persona;
};
exports.setProjectPersona = setProjectPersona;
let url = () => {
    const geminiUrl = process.env.GEMINI_URL;
    if (!geminiUrl) {
        throw new Error('Gemini URL not set in .env file');
    }
    return geminiUrl;
};
let key = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not set in .env file');
    }
    return apiKey;
};
function getCodeRefinements(files) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = key();
        const geminiUrl = url();
        if (files.length === 0) {
            throw new Error('No files provided for refinement.');
        }
        const prompt = yield codeRefinementPrompt(files);
        const response = yield (0, node_fetch_1.default)(geminiUrl, {
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
            const errorBody = yield response.text();
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = yield response.json();
        const responseText = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!responseText) {
            throw new Error('No valid content found in Gemini API response.');
        }
        try {
            const refinedData = JSON.parse(responseText);
            return refinedData;
        }
        catch (error) {
            throw new Error("The response from the Gemini API was not valid JSON.");
        }
    });
}
exports.getCodeRefinements = getCodeRefinements;
function suggestComment(files) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = key();
        const geminiUrl = url();
        if (files.length === 0) {
            throw new Error('No files provided to generate a commit message.');
        }
        const prompt = yield conventionalCommitPrompt(files);
        const response = yield (0, node_fetch_1.default)(geminiUrl, {
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
            const errorBody = yield response.text();
            console.error("API Error:", errorBody);
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = yield response.json();
        const text = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!text) {
            throw new Error('No valid content found in Gemini API response.');
        }
        return text.trim();
    });
}
exports.suggestComment = suggestComment;
function generateFileStructure(projectDetails) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = key();
        const geminiUrl = url();
        const persona = yield (0, githubUtils_1.fetchRepoPersona)(projectDetails.refRepos);
        const prompt = yield generateFileStructurePrompt(projectDetails, JSON.stringify(persona));
        const response = yield (0, node_fetch_1.default)(geminiUrl, {
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
            const errorBody = yield response.text();
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = yield response.json();
        const text = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!text) {
            throw new Error('No valid content found in Gemini API response.');
        }
        const errors = [];
        const parsedJson = (0, jsonc_parser_1.parse)(text, errors);
        if (errors.length > 0) {
            console.warn("JSONC parser encountered recoverable errors:", errors);
        }
        if (parsedJson === undefined) {
            throw new Error("Failed to parse the JSON structure from the API response.");
        }
        return parsedJson;
    });
}
exports.generateFileStructure = generateFileStructure;
function generateFileStructurePrompt(details, persona) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Fetch the custom prompt template from .ghostdev/prompts.json or get the default.
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('generateFileStructure');
        // 2. Inject the project data into the template's placeholders.
        const finalPrompt = promptTemplate
            .replace('{{projectName}}', details.name)
            .replace('{{projectDescription}}', details.desc)
            .replace('{{techStack}}', details.techStack.join(', '))
            .replace('{{persona}}', persona);
        return finalPrompt;
    });
}
function codeRefinementPrompt(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Fetch the custom prompt template
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('getCodeRefinements');
        // 2. Use the globally set persona
        const personaString = projectPersona ? JSON.stringify(projectPersona, null, 2) : "{}";
        const filesJson = JSON.stringify(files, null, 2);
        // 3. Inject data into the template
        const finalPrompt = promptTemplate
            .replace('{{persona}}', personaString)
            .replace('{{diffDataAsJson}}', filesJson);
        return finalPrompt;
    });
}
// const conventionalCommitPrompt = (files: GitDiffData[]): string => (
// `
// You are an expert AI assistant that writes concise, conventional git commit messages. Your task is to analyze a set of git diffs, determine the overarching intent of the changes, and generate a single, high-quality commit message that summarizes them.
// ## Your Task
// Analyze Intent: First, determine the primary goal that unifies all the changes. Are they fixing a bug, adding a new feature, or refactoring code?
// Determine Type & Scope: Based on the intent and the file paths, select the most appropriate commit type and scope.
// Craft Subject: Write a concise subject line that describes the change in the imperative mood (e.g., "add," "fix," "update," not "added," "fixes," or "updates").
// ## Conventional Commit Rule
// Format: Your message must strictly follow the <type>(<scope>): <subject> format.
// Type: Choose the <type> from this list: feat, fix, chore, refactor, docs, style, test, build, ci, perf.
// Scope: Infer a logical, singular <scope> from the affected file paths (e.g., api, auth, ui, payment). The scope is optional if the changes are widespread and defy a single descriptor.
// Subject:
// Keep the subject line under 50 characters.
// Start with a lowercase letter.
// Do not end the subject with a period.
// ## Example
// Input Diffs Example:
// JSON
// [
//   {
//     "name": "src/components/UserProfile.js",
//     "diff": "--- a/src/components/UserProfile.js\n+++ b/src/components/UserProfile.js\n@@ -10,1 +10,1 @@\n-    <p>Loading...</p>\n+    <p>Loading user data...</p>"
//   },
//   {
//     "name": "src/api/users.js",
//     "diff": "--- a/src/api/users.js\n+++ b/src/api/users.js\n@@ -5,3 +5,4 @@\n-  // TODO: Add error handling\n+  if (!response.ok) {\n+    throw new Error('Failed to fetch user');\n+  }"
//   }
// ]
// Expected Output Example:
// fix(api): add error handling to user fetch
// ## Strict Output Format
// Your response MUST be only the commit message string.
// Do not include any extra text, explanations, or markdown formatting.
// ## Final Prompt for API Call
// (Provide the actual input data below this line)
// Input Diffs:
// \`\`\`json
// ${JSON.stringify(files.map(f => ({ name: f.name, diff: f.diff })), null, 2)}
// \`\`\`
// `
// );
function conventionalCommitPrompt(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Fetch the custom prompt template from .ghostdev/prompts.json or get the default.
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('suggestComment');
        // 2. Prepare the data in the exact JSON format the prompt expects.
        const diffAsJson = JSON.stringify(files.map(f => ({ name: f.name, diff: f.diff })), null, 2);
        // 3. Inject the JSON data into the template's placeholder.
        const finalPrompt = promptTemplate.replace('{{diffDataAsJson}}', diffAsJson);
        return finalPrompt;
    });
}
