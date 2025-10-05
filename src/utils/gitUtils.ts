import * as vscode from 'vscode';
import { executeCommand } from './terminalUtils';

export interface GitDiffData {
    name: string;
    diff: string;
    code: string;
}

export async function openDifftool(): Promise<void> {
    try {
        await executeCommand('git config --global diff.tool vscode-diff');
        await executeCommand('git config --global difftool.vscode-diff.cmd "code --wait --diff $LOCAL $REMOTE"');
        await executeCommand('git config --global difftool.prompt false');
        await executeCommand('git difftool');

    } catch (error: any) {
        console.error('An error occurred while setting up or running git difftool:', error);
        vscode.window.showErrorMessage(`Failed to open Git difftool: ${error.message}`);
    }
}

export async function getDiffData(): Promise<GitDiffData[]> {
    try {
        const changedFilesOutput = await executeCommand('git diff --staged --name-only');
        const allFilePaths = changedFilesOutput.trim().split('\n').filter(Boolean);
        const filteredFilePaths = allFilePaths.filter(path => 
            !path.startsWith('node_modules/') && !path.startsWith('.vscode/')
        );
        if (filteredFilePaths.length === 0) {
            return [];
        }
        const diffDataPromises = filteredFilePaths.map(async (filePath) => {
            const diff = await executeCommand(`git diff --staged -- "${filePath}"`);
            const code = await executeCommand(`git show :"${filePath}"`);
            return { name: filePath, diff, code };
        });
        return Promise.all(diffDataPromises);

    } catch (error: any) {
        console.error('An error occurred while getting git diff data:', error);
        vscode.window.showErrorMessage(`Failed to get Git diff data: ${error.message}`);
        return [];
    }
}