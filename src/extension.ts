import * as vscode from 'vscode';
import { getDiffData, GitDiffData } from './utils/gitUtils';
import { getCodeRefinements, RefinedCode } from './utils/geminiUtils';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage('GhostDev is haunting your code — watch it clean up your mess!');

}


export function deactivate() {}