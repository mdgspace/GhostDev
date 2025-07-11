const vscode = require('vscode');
const path = require('path');
const { registerAuthCommand } = require('./commands/auth.cjs');
const { registerNewRepoCommand } = require('./commands/newRepo.cjs');
const { logout } = require('./commands/logout.cjs');

async function activate(context) {
  console.log('Extension "ghostdev" is now active!');
  registerAuthCommand(context);
  registerNewRepoCommand(context);
  logout(context);

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

    // Automatically suggest commit after Git add
    const suggest = await vscode.window.showInformationMessage(
      'Would you like help writing your next Git commit message?',
      'Suggest Now', 'Skip'
    );
    if (suggest === 'Suggest Now') {
      runPythonCommitSuggester();
    }
  }
}

function runPythonCommitSuggester() {
  const pythonScriptPath = path.join(__dirname, 'scripts', 'suggest_commit.py');
  const terminal = vscode.window.createTerminal('GhostDev Commit Suggester');
  terminal.sendText(`python3 "${pythonScriptPath}"`);
  terminal.show();
}

function deactivate() {}

module.exports = { activate, deactivate };
