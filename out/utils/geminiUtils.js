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
exports.generateFileStructure = exports.suggestComment = exports.getCodeRefinements = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
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
        if (files.length === 0) {
            throw new Error('No files provided for refinement.');
        }
        const prompt = codeRefinementPrompt(files);
        const response = yield (0, node_fetch_1.default)(GEMINI_URL, {
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
        if (files.length === 0) {
            throw new Error('No files provided to generate a commit message.');
        }
        const prompt = conventionalCommitPrompt(files);
        const response = yield (0, node_fetch_1.default)(GEMINI_URL, {
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
        return text.trim();
    });
}
exports.suggestComment = suggestComment;
function generateFileStructure(details) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = key();
        const prompt = fileStructurePrompt(details);
        const response = yield (0, node_fetch_1.default)(GEMINI_URL, {
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
            const parsedJson = JSON.parse(responseText);
            const structure = parsedJson.projectStructure;
            if (!structure || !Array.isArray(structure)) {
                throw new Error("Response JSON is missing the 'projectStructure' array.");
            }
            return structure;
        }
        catch (error) {
            throw new Error("The response from the Gemini API was not valid JSON or did not match the expected format.");
        }
    });
}
exports.generateFileStructure = generateFileStructure;
const codeRefinementPrompt = (files) => (`
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
`);
const conventionalCommitPrompt = (files) => (`
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
`);
const fileStructurePrompt = (details) => (`You are an expert software architect and project scaffolding assistant. Your task is to generate a complete and optimal file structure along with functional boilerplate code for a new software project based on the provided details.

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
`);
