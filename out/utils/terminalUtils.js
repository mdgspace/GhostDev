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
exports.makeFileStructure = exports.updateFilesInWorkspace = exports.runCommandVisible = exports.runCommandHidden = exports.executeCommand = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const jsonc_parser_1 = require("jsonc-parser");
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
        const rootUri = workspaceFolder.uri;
        try {
            const updatePromises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const fileUri = vscode.Uri.joinPath(rootUri, file.name);
                const formattedComment = formatDescComment(file.desc, file.name);
                const newContent = desc ? `${formattedComment}\n\n${file.code}` : file.code;
                const contentBytes = new TextEncoder().encode(newContent);
                yield vscode.workspace.fs.writeFile(fileUri, contentBytes);
            }));
            yield Promise.all(updatePromises);
            vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
        }
        catch (error) {
            console.error('Failed to update files in workspace:', error);
            throw new Error(`An error occurred while writing files: ${error.message}`);
        }
    });
}
exports.updateFilesInWorkspace = updateFilesInWorkspace;
function makeFileStructure(files) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        if (!workspaceFolder) {
            throw new Error("No open project folder found.");
        }
        const rootUri = workspaceFolder.uri;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Creating your new project...",
            cancellable: false
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            try {
                progress.report({ message: "Generating files and folders..." });
                const createdDirs = new Set();
                for (const file of files) {
                    const fileUri = vscode.Uri.joinPath(rootUri, file.fullPath);
                    const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
                    if (!createdDirs.has(dirUri.fsPath)) {
                        yield vscode.workspace.fs.createDirectory(dirUri);
                        createdDirs.add(dirUri.fsPath);
                    }
                    let contentToWrite = file.content;
                    // If the file is package.json, ensure its content is valid and formatted JSON
                    if (path.basename(file.fullPath) === 'package.json') {
                        try {
                            const parsedJson = (0, jsonc_parser_1.parse)(contentToWrite);
                            contentToWrite = JSON.stringify(parsedJson, null, 2);
                        }
                        catch (e) {
                            console.warn(`Could not parse package.json content for ${file.fullPath}, writing as is.`);
                        }
                    }
                    const contentBytes = new TextEncoder().encode(contentToWrite);
                    yield vscode.workspace.fs.writeFile(fileUri, contentBytes);
                }
                progress.report({ message: "Initializing Git repository..." });
                yield executeCommand('git init');
                const hasPackageJson = files.some(file => path.basename(file.fullPath) === 'package.json');
                if (hasPackageJson) {
                    progress.report({ message: "Installing dependencies (npm install)..." });
                    yield executeCommand('npm install');
                }
                progress.report({ message: "Staging all files..." });
                yield executeCommand('git add .');
                vscode.window.showInformationMessage('Project scaffolding complete!');
            }
            catch (error) {
                console.error('Failed to make file structure:', error);
                vscode.window.showErrorMessage(`Project creation failed: ${error.message}`);
            }
        }));
    });
}
exports.makeFileStructure = makeFileStructure;
