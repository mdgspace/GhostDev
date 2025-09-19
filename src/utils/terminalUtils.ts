import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

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