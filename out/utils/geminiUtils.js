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
        //Fetch the custom prompt template from .ghostdev/prompts.json or get the default.
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('generateFileStructure');
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
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('getCodeRefinements');
        const personaString = projectPersona ? JSON.stringify(projectPersona, null, 2) : "{}";
        const filesJson = JSON.stringify(files, null, 2);
        const finalPrompt = promptTemplate
            .replace('{{persona}}', personaString)
            .replace('{{diffDataAsJson}}', filesJson);
        return finalPrompt;
    });
}
function conventionalCommitPrompt(files) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(files)) {
            console.error("conventionalCommitPrompt Error: The input 'files' is not an array. Received:", files);
            throw new TypeError("Input to conventionalCommitPrompt must be an array.");
        }
        const promptTemplate = yield (0, promptUtils_1.getCustomPrompt)('suggestComment');
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
    });
}
