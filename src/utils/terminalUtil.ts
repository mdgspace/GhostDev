import * as vscode from 'vscode';
import { exec } from 'child_process';

export async function runCommandGetOutput(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(new Error(`Failed to execute command: ${command}. Stderr: ${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
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