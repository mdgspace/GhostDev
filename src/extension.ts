import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
    // Gemini API key (replace with your actual key)
    const GEMINI_API_KEY = 'AIzaSyBYtxe14WSs10loY18BnLHlJXshfz8yigA';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    async function fetchVSCodeDescription() {
        const prompt = 'What is Visual Studio Code?';
        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json() as any;
            let description = 'No description found.';
            if (data && Array.isArray(data.candidates) && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
                    description = candidate.content.parts[0].text || description;
                }
            }
            vscode.window.showInformationMessage(description);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to fetch VS Code description from Gemini.');
        }
    }

    fetchVSCodeDescription();
}

export function deactivate() {}