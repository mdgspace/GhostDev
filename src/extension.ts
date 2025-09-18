import * as vscode from 'vscode';
import { callGemini } from './utils/geminiUtil';

export function activate(context: vscode.ExtensionContext) {

    async function fetchVSCodeDescription() {
        vscode.window.showInformationMessage('GhostDev is haunting your code — watch it clean up your mess!');
        const prompt = 'What is Visual Studio Code?';
        try {
            const description = await callGemini(prompt);
            vscode.window.showInformationMessage(description);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to fetch Gemini response: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    fetchVSCodeDescription();

    
}

export function deactivate() {}