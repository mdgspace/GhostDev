const vscode = require('vscode');
const path = require('path');
const { SuggestionContentProvider } = require('../utils/virtualFileCreator.cjs');
//const { suggestCommitLLMFromFile } = require('../repodata/generateCommit.js');

function registerSuggestCodeCommand(context) {
  const provider = new SuggestionContentProvider();

  // Register the content provider for the 'ghost' scheme
  const registration = vscode.workspace.registerTextDocumentContentProvider('ghost', provider);
  context.subscriptions.push(registration);

  const disposable = vscode.commands.registerCommand('ghostdev.showCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('Open a file to get commit suggestions.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const originalContent = editor.document.getText();

    let aiContent;
    try {
      aiContent = await suggestCodeFromLLM(filePath); // Your custom LLM function
    } catch (err) {
      vscode.window.showErrorMessage('Failed to get AI suggestion: ' + err.message);
      return;
    }

    const ghostUri = vscode.Uri.parse(`ghost:${filePath}`);
    provider.setContent(ghostUri, aiContent);

    await vscode.commands.executeCommand('vscode.diff', ghostUri, editor.document.uri, 'AI Suggestion ↔ Your Code');
  });

  context.subscriptions.push(disposable);
}

module.exports = { registerSuggestCodeCommand };
