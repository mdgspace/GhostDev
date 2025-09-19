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
function activate(context) {
    vscode.window.showInformationMessage('GhostDev is haunting your code — watch it clean up your mess!');
    let disposable = vscode.commands.registerCommand('extension.improveCode', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let diffData = [];
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing Staged Git Files...",
                cancellable: false
            }, () => __awaiter(this, void 0, void 0, function* () {
                diffData = yield (0, gitUtils_1.getDiffData)();
            }));
            if (diffData.length === 0) {
                vscode.window.showInformationMessage('No staged files found to analyze.');
                return;
            }
            const formattedContent = formatDataAsMarkdown(diffData);
            const doc = yield vscode.workspace.openTextDocument({
                content: formattedContent,
                language: 'markdown'
            });
            yield vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
        }
        catch (error) {
            console.error('Failed to execute "improveCode" command:', error);
            vscode.window.showErrorMessage(`An unexpected error occurred: ${error.message}`);
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function formatDataAsMarkdown(diffData) {
    const reportParts = diffData.map(item => {
        var _a;
        const fileHeader = `# File: ${item.name}\n---`;
        const diffSection = `## Diff\n\`\`\`diff\n${item.diff}\n\`\`\``;
        const codeContent = (_a = item.code) !== null && _a !== void 0 ? _a : 'File content not available (e.g., file was deleted).';
        const codeSection = `## Staged Code\n\`\`\`\n${codeContent}\n\`\`\``;
        return `${fileHeader}\n\n${diffSection}\n\n${codeSection}`;
    });
    return `# Git Staged Changes Report\n\n${reportParts.join('\n\n')}`;
}
function deactivate() { }
exports.deactivate = deactivate;
