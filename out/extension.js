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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function callLLM(prompt) {
    vscode.window.showInformationMessage('Calling LLM to generate suggestions...');
    return new Promise(resolve => {
        setTimeout(() => {
            const suggestedCode = `
// The original code has been replaced with this AI-generated version.
// The LLM has analyzed your changes and suggested improvements.
// For example, this function is now more efficient:
function getOptimizedData(input) {
    // This is the optimized code based on your diff.
    const optimizedResult = input.map(item => item * 2);
    return optimizedData;
}
            `;
            resolve(suggestedCode);
        }, 3000);
    });
}
function activate(context) {
    let disposable = vscode.commands.registerCommand('vsc-llm-code-suggester.suggestCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }
        const currentDocument = editor.document;
        if (currentDocument.isUntitled || currentDocument.isDirty) {
            vscode.window.showErrorMessage('Please commit and save your changes before running the suggestions.');
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating code suggestions...",
            cancellable: false
        }, async (progress) => {
            try {
                // Step 1: Get the diff between the last two commits
                progress.report({ message: 'Analyzing git history...' });
                const { stdout: diffOutput } = await execAsync('git diff HEAD~1 HEAD --name-only', { cwd: vscode.workspace.rootPath });
                const changedFiles = diffOutput.trim().split('\n').filter(Boolean);
                if (!changedFiles.includes(currentDocument.fileName.replace(vscode.workspace.rootPath + '/', ''))) {
                    vscode.window.showInformationMessage('No changes found for this file in the last commit. Nothing to suggest.');
                    return;
                }
                // Step 2: Get original code and diff for the current file
                progress.report({ message: 'Fetching code diff...' });
                const relativePath = vscode.workspace.asRelativePath(currentDocument.fileName);
                const { stdout: originalCode } = await execAsync(`git show HEAD~1:"${relativePath}"`, { cwd: vscode.workspace.rootPath });
                const { stdout: diffCode } = await execAsync(`git diff HEAD~1 HEAD -- "${relativePath}"`, { cwd: vscode.workspace.rootPath });
                // Step 3: Create a prompt for the LLM
                const prompt = `
You are a world-class code reviewer and refactoring expert. 
The user has committed a change to a file. 
Analyze the original code and the diff to understand the user's intent. 
Then, provide a complete, better version of the file's code. 
Only provide the final code, with no extra explanations or markdown formatting.

Original Code (from HEAD~1 commit):
\`\`\`
${originalCode}
\`\`\`

Code Diff:
\`\`\`
${diffCode}
\`\`\`
`;
                // Step 4: Call the LLM with the prompt
                progress.report({ message: 'Calling LLM for suggestions...' });
                const suggestedCode = await callLLM(prompt);
                // Step 5: Replace the current file's content with the suggested code
                const wholeDocumentRange = new vscode.Range(currentDocument.lineAt(0).range.start, currentDocument.lineAt(currentDocument.lineCount - 1).range.end);
                await editor.edit(editBuilder => {
                    editBuilder.replace(wholeDocumentRange, suggestedCode);
                });
                vscode.window.showInformationMessage('Code suggestions have been applied.');
                // Step 6: Execute the requested git commands
                try {
                    progress.report({ message: 'Saving and staging changes...' });
                    // Save all open documents to ensure the changes are on disk
                    for (const doc of vscode.workspace.textDocuments) {
                        if (doc.isDirty) {
                            await doc.save();
                        }
                    }
                    // Stage the newly generated code
                    await execAsync('git add .', { cwd: vscode.workspace.rootPath });
                    // Set up the global git diff tool configuration for VSCode
                    await execAsync('git config --global diff.tool vscode', { cwd: vscode.workspace.rootPath });
                    await execAsync('git config --global difftool.vscode.cmd "code --wait --diff \\$LOCAL \\$REMOTE"', { cwd: vscode.workspace.rootPath });
                    // NEW: Use the VSCode Terminal to run the interactive command
                    const terminal = vscode.window.createTerminal('Git Difftool');
                    terminal.show(); // Show the new terminal panel
                    terminal.sendText('git difftool --staged');
                    // Note: The second `git add .` cannot be run automatically here,
                    // as `git difftool` is an interactive process. The user must
                    // manually re-add changes after reviewing and closing the diff window.
                    vscode.window.showInformationMessage('Git difftool has been launched. Please review the changes in the new window and close it to continue. You will need to stage your changes manually after reviewing.');
                }
                catch (gitError) {
                    vscode.window.showErrorMessage(`Git command failed: ${gitError.message}`);
                    console.error('Git Command Error:', gitError);
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to get suggestions: ${error.message}`);
                console.error(error);
            }
        });
    });
    context.subscriptions.push(disposable);
}
// This function is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map