import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage('GhostDev is haunting your code — watch it clean up your mess!');
}

export function deactivate() {}