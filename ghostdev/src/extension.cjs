const vscode = require('vscode');
const path = require('path');
const { registerAuthCommand } = require('./commands/auth.cjs');
const { registerNewRepoCommand } = require('./commands/newRepo.cjs');
const { logout } = require('./commands/logout.cjs');
//const { registerSuggestCommitCommand } = require('./commands/suggest_commit_cmd.js'); 

async function activate(context) {
  console.log('Extension "ghostdev" is now active!');
  registerAuthCommand(context);
  registerNewRepoCommand(context);
  logout(context);
  //registerSuggestCommitCommand(context);

  const isAuthed = context.globalState.get('isAuthed', false);

  if (!isAuthed) {
    const connect = await vscode.window.showInformationMessage(
      'Welcome to GhostDev! Connect your GitHub account to get started.',
      'Connect with GitHub'
    );

    if (connect === 'Connect with GitHub') {
      await vscode.commands.executeCommand('ghostdev.auth');
      await context.globalState.update('isAuthed', true);

      vscode.window.showInformationMessage('GitHub connected successfully 🎉');

      const start = await vscode.window.showInformationMessage(
        'Would you like to start a new project now?',
        'Yes', 'Later'
      );
      if (start === 'Yes') {
        vscode.commands.executeCommand('ghostdev.newRepo');
      }
    }
  } else {
    const start = await vscode.window.showInformationMessage(
      'Start a new GhostDev project?',
      'Yes', 'Not now'
    );
    if (start === 'Yes') {
      vscode.commands.executeCommand('ghostdev.newRepo');
    }

    const suggest = await vscode.window.showInformationMessage(
      'Would you like help writing your next Git commit message?',
      'Suggest Now', 'Skip'
    );
    if (suggest === 'Suggest Now') {
      //const suggestedCommit = `git commit -m ${commit}`; // replace with real LLM output
      //runSmartCommitPython(suggestedCommit);
      //await vscode.commands.executeCommand('ghostdev.suggestCommit');
    }
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
