"use strict";
// import * as vscode from 'vscode';
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import * as path from 'path';
// import { RefinedCode } from './geminiUtils';
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
exports.makeFileStructure = exports.updateFilesInWorkspace = exports.runCommandVisible = exports.runCommandHidden = exports.executeCommand = void 0;
// const execAsync = promisify(exec);
// export async function executeCommand(command: string): Promise<string> {
//     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
//     if (!workspaceFolder) {
//         throw new Error("No open project folder found.");
//     }
//     const cwd = workspaceFolder.uri.fsPath;
//     try {
//         const { stdout, stderr } = await execAsync(command, { cwd });
//         if (stderr) {
//             console.warn('Command produced stderr:', stderr);
//         }
//         return stdout.trim();
//     } catch (error: any) {
//         console.error(`Execution failed: ${error}`);
//         throw new Error(`Failed to execute command: "${command}".\nError: ${error.stderr || error.message}`);
//     }
// }
// export async function runCommandHidden(command: string): Promise<void> {
//     const terminal = vscode.window.createTerminal({ name: 'GhostDev Hidden Terminal' });
//     terminal.sendText(command);
//     terminal.hide();
// }
// export async function runCommandVisible(command: string): Promise<void> {
//     const terminal = vscode.window.createTerminal({ name: 'GhostDev Terminal' });
//     terminal.sendText(command);
//     terminal.show();
// }
// function formatDescComment(description: string, fileName: string): string {
//     const extension = path.extname(fileName);
//     const lines = description.trim().split('\n');
//     switch (extension) {
//         case '.js':
//         case '.ts':
//         case '.jsx':
//         case '.tsx':
//         case '.css':
//         case '.scss':
//         case '.java':
//         case '.c':
//         case '.cpp':
//         case '.cs':
//         case '.go':
//             if (lines.length === 1) {
//                 return `/** ${lines[0]} */`;
//             }
//             return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
//         case '.py':
//         case '.rb':
//             return ['"""', ...lines, '"""'].join('\n');
//         case '.html':
//         case '.xml':
//             return ['<!--', ...lines.map(line => `  ${line}`), '-->'].join('\n');
//         default:
//             return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
//     }
// }
// export async function updateFilesInWorkspace(files: RefinedCode[], desc: Boolean): Promise<void> {
//     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
//     if (!workspaceFolder) {
//         throw new Error("No open project folder found. Cannot update files.");
//     }
//     const rootUri = workspaceFolder.uri;
//     try {
//         const updatePromises = files.map(async (file) => {
//             const fileUri = vscode.Uri.joinPath(rootUri, file.name);
//             const formattedComment = formatDescComment(file.desc, file.name);
//             const newContent = desc? `${formattedComment}\n\n${file.code}`:file.code;
//             const contentBytes = new TextEncoder().encode(newContent);
//             await vscode.workspace.fs.writeFile(fileUri, contentBytes);
//         });
//         await Promise.all(updatePromises);
//         vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
//     } catch (error: any) {
//         console.error('Failed to update files in workspace:', error);
//         throw new Error(`An error occurred while writing files: ${error.message}`);
//     }
// }
// export async function makeFileStructure(fileStructure: { [key: string]: any }) {
//     const workspaceFolders = vscode.workspace.workspaceFolders;
//     if (!workspaceFolders || workspaceFolders.length === 0) {
//         vscode.window.showErrorMessage("Cannot create project: Please open a folder or workspace first.");
//         return;
//     }
//     const workspaceRootUri = workspaceFolders[0].uri;
//     await vscode.window.withProgress({
//         location: vscode.ProgressLocation.Notification,
//         title: "Building your project...",
//         cancellable: false
//     }, async (progress) => {
//         try {
//             async function create(currentUri: vscode.Uri, structure: { [key: string]: any }) {
//                 for (const [name, content] of Object.entries(structure)) {
//                     const newUri = vscode.Uri.joinPath(currentUri, name);
//                     if (typeof content === 'string') {
//                         progress.report({ message: `Creating file: ${name}` });
//                         const fileContent = Buffer.from(content, 'utf8');
//                         await vscode.workspace.fs.writeFile(newUri, fileContent);
//                     } else if (typeof content === 'object' && content !== null) {
//                         progress.report({ message: `Creating directory: ${name}/` });
//                         await vscode.workspace.fs.createDirectory(newUri);
//                         await create(newUri, content);
//                     }
//                 }
//             }
//             await create(workspaceRootUri, fileStructure);
//             progress.report({ message: "Initializing Git repository..." });
//             await executeCommand('git init');
//             progress.report({ message: "Adding files to Git..." });
//             await executeCommand('git add .');
//             vscode.window.showInformationMessage("✅ Project structure created successfully!");
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error);
//             vscode.window.showErrorMessage(`Failed to create project structure: ${errorMessage}`);
//             console.error(error);
//         }
//     });
// }
// // import * as vscode from 'vscode';
// // import { exec } from 'child_process';
// // import { promisify } from 'util';
// // import * as path from 'path';
// // import { RefinedCode } from './geminiUtils';
// // const execAsync = promisify(exec);
// // export async function executeCommand(command: string): Promise<string> {
// //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
// //     if (!workspaceFolder) {
// //         throw new Error("No open project folder found.");
// //     }
// //     const cwd = workspaceFolder.uri.fsPath;
// //     try {
// //         const { stdout, stderr } = await execAsync(command, { cwd });
// //         if (stderr) {
// //             console.warn('Command produced stderr:', stderr);
// //         }
// //         return stdout.trim();
// //     } catch (error: any) {
// //         console.error(`Execution failed: ${error}`);
// //         throw new Error(`Failed to execute command: "${command}".\nError: ${error.stderr || error.message}`);
// //     }
// // }
// // export async function runCommandHidden(command: string): Promise<void> {
// //     const terminal = vscode.window.createTerminal({ name: 'GhostDev Hidden Terminal' });
// //     terminal.sendText(command);
// //     terminal.hide();
// // }
// // export async function runCommandVisible(command: string): Promise<void> {
// //     const terminal = vscode.window.createTerminal({ name: 'GhostDev Terminal' });
// //     terminal.sendText(command);
// //     terminal.show();
// // }
// // function formatDescComment(description: string, fileName: string): string {
// //     const extension = path.extname(fileName);
// //     const lines = description.trim().split('\n');
// //     switch (extension) {
// //         case '.js':
// //         case '.ts':
// //         case '.jsx':
// //         case '.tsx':
// //         case '.css':
// //         case '.scss':
// //         case '.java':
// //         case '.c':
// //         case '.cpp':
// //         case '.cs':
// //         case '.go':
// //             if (lines.length === 1) {
// //                 return `/** ${lines[0]} */`;
// //             }
// //             return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
// //         case '.py':
// //         case '.rb':
// //             return ['"""', ...lines, '"""'].join('\n');
// //         case '.html':
// //         case '.xml':
// //             return ['<!--', ...lines.map(line => `  ${line}`), '-->'].join('\n');
// //         default:
// //             return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
// //     }
// // }
// // export async function updateFilesInWorkspace(files: RefinedCode[], desc: Boolean): Promise<void> {
// //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
// //     if (!workspaceFolder) {
// //         throw new Error("No open project folder found. Cannot update files.");
// //     }
// //     // Add a robust type check to prevent the ".map is not a function" error.
// //     if (!Array.isArray(files)) {
// //         console.error("updateFilesInWorkspace Error: The input 'files' is not an array. Received:", files);
// //         throw new TypeError("An error occurred while preparing files for writing. The input data was not in the expected array format.");
// //     }
// //     const rootUri = workspaceFolder.uri;
// //     try {
// //         // Initialize an empty array to hold the promises for each file-writing operation.
// //         const updatePromises: Promise<void>[] = [];
// //         // Use a for...of loop for safer iteration.
// //         for (const file of files) {
// //             const fileUri = vscode.Uri.joinPath(rootUri, file.name);
// //             const formattedComment = formatDescComment(file.desc, file.name);
// //             const newContent = desc ? `${formattedComment}\n\n${file.code}` : file.code;
// //             const contentBytes = new TextEncoder().encode(newContent);
// //             // Start the file write operation and add its promise to our array.
// //             // We do not 'await' here, allowing all writes to run in parallel.
// //             const writePromise = vscode.workspace.fs.writeFile(fileUri, contentBytes);
// //             updatePromises.push(writePromise);
// //         }
// //         // Wait for all the collected file-writing promises to complete.
// //         await Promise.all(updatePromises);
// //         vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
// //     } catch (error: any) {
// //         console.error('Failed to update files in workspace:', error);
// //         throw new Error(`An error occurred while writing files: ${error.message}`);
// //     }
// // }
// // export async function makeFileStructure(fileStructure: { [key: string]: any }) {
// //     const workspaceFolders = vscode.workspace.workspaceFolders;
// //     if (!workspaceFolders || workspaceFolders.length === 0) {
// //         vscode.window.showErrorMessage("Cannot create project: Please open a folder or workspace first.");
// //         return;
// //     }
// //     const workspaceRootUri = workspaceFolders[0].uri;
// //     await vscode.window.withProgress({
// //         location: vscode.ProgressLocation.Notification,
// //         title: "Building your project...",
// //         cancellable: false
// //     }, async (progress) => {
// //         try {
// //             async function create(currentUri: vscode.Uri, structure: { [key: string]: any }) {
// //                 for (const [name, content] of Object.entries(structure)) {
// //                     const newUri = vscode.Uri.joinPath(currentUri, name);
// //                     if (typeof content === 'string') {
// //                         progress.report({ message: `Creating file: ${name}` });
// //                         const fileContent = Buffer.from(content, 'utf8');
// //                         await vscode.workspace.fs.writeFile(newUri, fileContent);
// //                     } else if (typeof content === 'object' && content !== null) {
// //                         progress.report({ message: `Creating directory: ${name}/` });
// //                         await vscode.workspace.fs.createDirectory(newUri);
// //                         await create(newUri, content);
// //                     }
// //                 }
// //             }
// //             await create(workspaceRootUri, fileStructure);
// //             progress.report({ message: "Initializing Git repository..." });
// //             await executeCommand('git init');
// //             progress.report({ message: "Adding files to Git..." });
// //             await executeCommand('git add .');
// //             vscode.window.showInformationMessage("✅ Project structure created successfully!");
// //         } catch (error) {
// //             const errorMessage = error instanceof Error ? error.message : String(error);
// //             vscode.window.showErrorMessage(`Failed to create project structure: ${errorMessage}`);
// //             console.error(error);
// //         }
// //     });
// // }
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function executeCommand(command) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        if (!workspaceFolder) {
            throw new Error("No open project folder found.");
        }
        const cwd = workspaceFolder.uri.fsPath;
        try {
            const { stdout, stderr } = yield execAsync(command, { cwd });
            if (stderr) {
                console.warn('Command produced stderr:', stderr);
            }
            return stdout.trim();
        }
        catch (error) {
            console.error(`Execution failed: ${error}`);
            throw new Error(`Failed to execute command: "${command}".\nError: ${error.stderr || error.message}`);
        }
    });
}
exports.executeCommand = executeCommand;
function runCommandHidden(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const terminal = vscode.window.createTerminal({ name: 'GhostDev Hidden Terminal' });
        terminal.sendText(command);
        terminal.hide();
    });
}
exports.runCommandHidden = runCommandHidden;
function runCommandVisible(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const terminal = vscode.window.createTerminal({ name: 'GhostDev Terminal' });
        terminal.sendText(command);
        terminal.show();
    });
}
exports.runCommandVisible = runCommandVisible;
function formatDescComment(description, fileName) {
    const extension = path.extname(fileName);
    const lines = description.trim().split('\n');
    switch (extension) {
        case '.js':
        case '.ts':
        case '.jsx':
        case '.tsx':
        case '.css':
        case '.scss':
        case '.java':
        case '.c':
        case '.cpp':
        case '.cs':
        case '.go':
            if (lines.length === 1) {
                return `/** ${lines[0]} */`;
            }
            return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
        case '.py':
        case '.rb':
            return ['"""', ...lines, '"""'].join('\n');
        case '.html':
        case '.xml':
            return ['<!--', ...lines.map(line => `  ${line}`), '-->'].join('\n');
        default:
            return ['/**', ...lines.map(line => ` * ${line}`), ' */'].join('\n');
    }
}
function updateFilesInWorkspace(files, desc) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        if (!workspaceFolder) {
            throw new Error("No open project folder found. Cannot update files.");
        }
        if (!Array.isArray(files)) {
            console.error("updateFilesInWorkspace Error: The input 'files' is not an array. Received:", files);
            throw new TypeError("An error occurred while preparing files for writing. The input data was not in the expected array format.");
        }
        const rootUri = workspaceFolder.uri;
        try {
            // Rewrite to process files sequentially for better error handling and stability.
            for (const file of files) {
                // Defensive check for each file object to ensure it's valid.
                if (!file || typeof file.name !== 'string' || typeof file.code !== 'string' || typeof file.desc !== 'string') {
                    console.warn("Skipping invalid file data object received from API:", file);
                    continue; // Skip this iteration and move to the next file.
                }
                const fileUri = vscode.Uri.joinPath(rootUri, file.name);
                const formattedComment = formatDescComment(file.desc, file.name);
                const newContent = desc ? `${formattedComment}\n\n${file.code}` : file.code;
                const contentBytes = new TextEncoder().encode(newContent);
                // Await each file write individually. If one fails, the loop will stop here and
                // the error will be caught, making it clear which file caused the problem.
                yield vscode.workspace.fs.writeFile(fileUri, contentBytes);
            }
            vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
        }
        catch (error) {
            // The error message will now be more specific to the file that failed.
            console.error('Failed to update a file in the workspace:', error);
            throw new Error(`An error occurred while writing a file: ${error.message}`);
        }
    });
}
exports.updateFilesInWorkspace = updateFilesInWorkspace;
function makeFileStructure(fileStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("Cannot create project: Please open a folder or workspace first.");
            return;
        }
        const workspaceRootUri = workspaceFolders[0].uri;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Building your project...",
            cancellable: false
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            try {
                function create(currentUri, structure) {
                    return __awaiter(this, void 0, void 0, function* () {
                        for (const [name, content] of Object.entries(structure)) {
                            const newUri = vscode.Uri.joinPath(currentUri, name);
                            if (typeof content === 'string') {
                                progress.report({ message: `Creating file: ${name}` });
                                const fileContent = Buffer.from(content, 'utf8');
                                yield vscode.workspace.fs.writeFile(newUri, fileContent);
                            }
                            else if (typeof content === 'object' && content !== null) {
                                progress.report({ message: `Creating directory: ${name}/` });
                                yield vscode.workspace.fs.createDirectory(newUri);
                                yield create(newUri, content);
                            }
                        }
                    });
                }
                yield create(workspaceRootUri, fileStructure);
                progress.report({ message: "Initializing Git repository..." });
                yield executeCommand('git init');
                progress.report({ message: "Adding files to Git..." });
                yield executeCommand('git add .');
                vscode.window.showInformationMessage("✅ Project structure created successfully!");
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to create project structure: ${errorMessage}`);
                console.error(error);
            }
        }));
    });
}
exports.makeFileStructure = makeFileStructure;
