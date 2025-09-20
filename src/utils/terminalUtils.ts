import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { RefinedCode, FlatFile } from './geminiUtils';
import { parse } from 'jsonc-parser';

const execAsync = promisify(exec);

export async function executeCommand(command: string): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error("No open project folder found.");
    }
    const cwd = workspaceFolder.uri.fsPath;

    try {
        const { stdout, stderr } = await execAsync(command, { cwd });
        if (stderr) {
            console.warn('Command produced stderr:', stderr);
        }
        return stdout.trim();
    } catch (error: any) {
        console.error(`Execution failed: ${error}`);
        throw new Error(`Failed to execute command: "${command}".\nError: ${error.stderr || error.message}`);
    }
}

export async function runCommandHidden(command: string): Promise<void> {
    const terminal = vscode.window.createTerminal({ name: 'GhostDev Hidden Terminal' });
    terminal.sendText(command);
    terminal.hide();
}

export async function runCommandVisible(command: string): Promise<void> {
    const terminal = vscode.window.createTerminal({ name: 'GhostDev Terminal' });
    terminal.sendText(command);
    terminal.show();
}

function formatDescComment(description: string, fileName: string): string {
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

export async function updateFilesInWorkspace(files: RefinedCode[], desc: Boolean): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error("No open project folder found. Cannot update files.");
    }
    const rootUri = workspaceFolder.uri;
    try {
        const updatePromises = files.map(async (file) => {
            const fileUri = vscode.Uri.joinPath(rootUri, file.name);
            const formattedComment = formatDescComment(file.desc, file.name);
            const newContent = desc? `${formattedComment}\n\n${file.code}`:file.code;
            const contentBytes = new TextEncoder().encode(newContent);
            await vscode.workspace.fs.writeFile(fileUri, contentBytes);
        });
        await Promise.all(updatePromises);
        vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
    } catch (error: any) {
        console.error('Failed to update files in workspace:', error);
        throw new Error(`An error occurred while writing files: ${error.message}`);
    }
}

export async function makeFileStructure(files: FlatFile[]): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error("No open project folder found.");
    }
    const rootUri = workspaceFolder.uri;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creating your new project...",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: "Generating files and folders..." });
            const createdDirs = new Set<string>();

            for (const file of files) {
                const fileUri = vscode.Uri.joinPath(rootUri, file.fullPath);
                const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));

                if (!createdDirs.has(dirUri.fsPath)) {
                    await vscode.workspace.fs.createDirectory(dirUri);
                    createdDirs.add(dirUri.fsPath);
                }

                let contentToWrite = file.content;
                // If the file is package.json, ensure its content is valid and formatted JSON
                if (path.basename(file.fullPath) === 'package.json') {
                    try {
                        const parsedJson = parse(contentToWrite);
                        contentToWrite = JSON.stringify(parsedJson, null, 2);
                    } catch (e) {
                        console.warn(`Could not parse package.json content for ${file.fullPath}, writing as is.`);
                    }
                }

                const contentBytes = new TextEncoder().encode(contentToWrite);
                await vscode.workspace.fs.writeFile(fileUri, contentBytes);
            }

            progress.report({ message: "Initializing Git repository..." });
            await executeCommand('git init');

            const hasPackageJson = files.some(file => path.basename(file.fullPath) === 'package.json');
            if (hasPackageJson) {
                progress.report({ message: "Installing dependencies (npm install)..." });
                await executeCommand('npm install');
            }

            progress.report({ message: "Staging all files..." });
            await executeCommand('git add .');

            vscode.window.showInformationMessage('Project scaffolding complete!');

        } catch (error: any) {
            console.error('Failed to make file structure:', error);
            vscode.window.showErrorMessage(`Project creation failed: ${error.message}`);
        }
    });
}