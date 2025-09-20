import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage("GhostDev is haunting your VSCode!");
}
export function deactivate() { }