import * as vscode from 'vscode';

export interface Change {
	readonly uri: vscode.Uri;
}

export interface RepositoryState {
	readonly indexChanges: readonly Change[];
	// Add this line:
	readonly onDidChange: vscode.Event<void>; 
}

export interface Repository {
	readonly rootUri: vscode.Uri;
	readonly state: RepositoryState;
}

export interface API {
	repositories: Repository[];
	onDidOpenRepository: vscode.Event<Repository>;
}

export interface GitExtension {
	getAPI(version: 1): API;
}