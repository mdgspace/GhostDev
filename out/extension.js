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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const gitUtils_1 = require("./utils/gitUtils");
const geminiUtils_1 = require("./utils/geminiUtils");
const path = __importStar(require("path"));
function activate(context) {
    vscode.window.showInformationMessage('GhostDev is haunting your code — watch it clean up your mess!');
    // Register the command that ties everything together
    let disposable = vscode.commands.registerCommand('extension.improveCode', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Improving Code",
                cancellable: false
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                // Step 1: Get staged file data from Git
                progress.report({ message: "Fetching staged changes..." });
                const diffData = yield (0, gitUtils_1.getDiffData)();
                if (diffData.length === 0) {
                    vscode.window.showInformationMessage('No staged files found to improve.');
                    return; // Exit if there's nothing to do
                }
                // Step 2: Pass the data to Gemini for refinement
                progress.report({ message: "Analyzing and refining with AI..." });
                const refinedData = yield (0, geminiUtils_1.getCodeRefinements)(diffData);
                // Step 3: Format and display the results
                progress.report({ message: "Preparing report..." });
                const reportContent = formatRefinementAsMarkdown(refinedData);
                const doc = yield vscode.workspace.openTextDocument({
                    content: reportContent,
                    language: 'markdown'
                });
                // Show the report in a new editor column
                yield vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            }));
        }
        catch (error) {
            console.error('An error occurred during the improveCode command:', error);
            vscode.window.showErrorMessage(`Failed to improve code: ${error.message}`);
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
/**
 * Formats the refined data from the Gemini API into a readable Markdown string.
 */
function formatRefinementAsMarkdown(refinedData) {
    const reportParts = refinedData.map(item => {
        const fileHeader = `# File: ${item.name}\n---`;
        const descSection = `## Description\n${item.desc}`;
        // Determine the language for syntax highlighting from the file extension
        const language = path.extname(item.name).substring(1);
        const codeSection = `## Refined Code\n\`\`\`${language}\n${item.code}\n\`\`\``;
        return `${fileHeader}\n\n${descSection}\n\n${codeSection}`;
    });
    const title = `# Code Refinement Report\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;
    return title + reportParts.join('\n\n---\n\n');
}
function deactivate() { }
exports.deactivate = deactivate;
