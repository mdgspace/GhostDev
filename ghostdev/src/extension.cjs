const vscode = require('vscode');
const path = require('path');
const { registerAuthCommand } = require('./commands/auth.cjs');
const { registerNewRepoCommand } = require('./commands/newRepo.cjs');
const { logout } = require('./commands/logout.cjs');
const { createStatusBarButton, runGetSuggestion } = require('./commands/activation_button.cjs')
//const { registerSuggestCommitCommand } = require('./commands/suggest_commit_cmd.js'); 


async function safeExecuteCommand(command, ...args) {
  try {
    return await vscode.commands.executeCommand(command, ...args);
  } catch (err) {
    console.error(`Command error (${command}):`, err);
    vscode.window.showErrorMessage(`Failed to run ${command}: ${err.message || err}`);
  }
}


async function activate(context) {
  console.log('Extension "ghostdev" is now active!');
  try {
    await registerAuthCommand(context);
  } catch (e) {
    console.error('registerAuthCommand failed:', e);
  }
  try {
    await registerNewRepoCommand(context);
  } catch (e) {
    console.error('registerNewRepoCommand failed:', e);
  }
  try {
    logout(context);
  } catch (e) {
    console.error('logout registration failed:', e);
  }
  try {
    runGetSuggestion(context);
  } catch (e) {
    console.error('runGetSuggestion failed:', e);
  }
  //registerSuggestCommitCommand(context);

  const isAuthed = context.globalState.get('isAuthed', false);

  if (!isAuthed) {
    const connect = await vscode.window.showInformationMessage(
      'Welcome to GhostDev! Connect your GitHub account to get started.',
      'Connect with GitHub'
    );
    if (connect === 'Connect with GitHub') {
      const authResult = await safeExecuteCommand('ghostdev.auth');
      if (authResult !== undefined) {
        try {
          await context.globalState.update('isAuthed', true);
          vscode.window.showInformationMessage('GitHub connected successfully.');
        } catch (e) {
          console.error('Failed updating isAuthed:', e);
        }

        const start = await vscode.window.showInformationMessage(
          'Would you like to start a new project now?',
          'Yes',
          'Later'
        );
        if (start === 'Yes') {
          await safeExecuteCommand('ghostdev.newRepo');
        }
      }
    }
  
    return;
  }
  const start = await vscode.window.showInformationMessage(
    'Start a new GhostDev project?',
    'Yes',
    'Not now'
  );
  if (start === 'Yes') {
    await safeExecuteCommand('ghostdev.newRepo');
  }

  const suggest = await vscode.window.showInformationMessage(
    'Would you like help writing your next Git commit message?',
    'Suggest Now',
    'Skip'
  );
  if (suggest === 'Suggest Now') {
    await safeExecuteCommand('ghostdev.runFunction'); // triggers status bar command
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
