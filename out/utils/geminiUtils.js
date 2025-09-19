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
exports.getCodeRefinements = exports.callGemini = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
function callGemini(prompt) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not set in .env file');
        }
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;
        const response = yield (0, node_fetch_1.default)(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });
        if (!response.ok) {
            const errorBody = yield response.json().catch(() => ({}));
            const errorMessage = ((_a = errorBody === null || errorBody === void 0 ? void 0 : errorBody.error) === null || _a === void 0 ? void 0 : _a.message) || response.statusText;
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorMessage}`);
        }
        const data = yield response.json();
        // Use optional chaining to safely access the nested text property
        const text = (_f = (_e = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text;
        // If text is null, undefined, or an empty string, throw an error
        if (!text) {
            throw new Error('No valid content or text found in Gemini API response.');
        }
        return text;
    });
}
exports.callGemini = callGemini;
function getCodeRefinements(files) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not set in .env file');
        }
        // Using a model that supports JSON mode well, like Gemini 1.5 Pro or Flash
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
        // 1. Construct the detailed prompt
        const prompt = `
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
`;
        // 2. Make the API call with JSON mode enabled
        const response = yield (0, node_fetch_1.default)(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    // Enforce JSON output
                    responseMimeType: "application/json",
                },
            }),
        });
        if (!response.ok) {
            const errorBody = yield response.text();
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = yield response.json();
        // 3. Safely parse the response
        const responseText = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!responseText) {
            throw new Error('No valid content found in Gemini API response.');
        }
        try {
            // The response text itself is the JSON we need
            const refinedData = JSON.parse(responseText);
            return refinedData;
        }
        catch (error) {
            console.error("Failed to parse JSON response from Gemini:", responseText);
            throw new Error("The response from the Gemini API was not valid JSON.");
        }
    });
}
exports.getCodeRefinements = getCodeRefinements;
