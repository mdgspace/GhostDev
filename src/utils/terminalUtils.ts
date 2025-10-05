import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { RefinedCode } from './geminiUtils';

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

    if (!Array.isArray(files)) {
        console.error("updateFilesInWorkspace Error: The input 'files' is not an array. Received:", files);
        throw new TypeError("An error occurred while preparing files for writing. The input data was not in the expected array format.");
    }

    const rootUri = workspaceFolder.uri;
    try {
        for (const file of files) {
            if (!file || typeof file.name !== 'string' || typeof file.code !== 'string' || typeof file.desc !== 'string') {
                console.warn("Skipping invalid file data object received from API:", file);
                continue; // Skip this iteration and move to the next file.
            }

            const fileUri = vscode.Uri.joinPath(rootUri, file.name);
            const formattedComment = formatDescComment(file.desc, file.name);
            const newContent = desc ? `${formattedComment}\n\n${file.code}` : file.code;
            const contentBytes = new TextEncoder().encode(newContent);
            await vscode.workspace.fs.writeFile(fileUri, contentBytes);
        }
        
        vscode.window.showInformationMessage(`Successfully updated ${files.length} file(s).`);
    } catch (error: any) {
        console.error('Failed to update a file in the workspace:', error);
        throw new Error(`An error occurred while writing a file: ${error.message}`);
    }
}

export async function makeFileStructure(fileStructure: { [key: string]: any }) {

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Cannot create project: Please open a folder or workspace first.");
        return;
    }
    const workspaceRootUri = workspaceFolders[0].uri;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Building your project...",
        cancellable: false
    }, async (progress) => {

        try {

            async function create(currentUri: vscode.Uri, structure: { [key: string]: any }) {
                for (const [name, content] of Object.entries(structure)) {
                    const newUri = vscode.Uri.joinPath(currentUri, name);
                    
                    if (typeof content === 'string') {
                        progress.report({ message: `Creating file: ${name}` });
                        const fileContent = Buffer.from(content, 'utf8');
                        await vscode.workspace.fs.writeFile(newUri, fileContent);
                    } else if (typeof content === 'object' && content !== null) {
                        progress.report({ message: `Creating directory: ${name}/` });
                        await vscode.workspace.fs.createDirectory(newUri);
                        await create(newUri, content);
                    }
                }
            }

            await create(workspaceRootUri, fileStructure);
            progress.report({ message: "Initializing Git repository..." });
            await executeCommand('git init');
            progress.report({ message: "Adding files to Git..." });
            await executeCommand('git add .');

            vscode.window.showInformationMessage("✅ Project structure created successfully!");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to create project structure: ${errorMessage}`);
            console.error(error);
        }
    });
}