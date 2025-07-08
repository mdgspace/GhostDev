const vscode = require('vscode');

function logout(context) {
    const disposable = vscode.commands.registerCommand('ghostdev.logout', async () => {
      await context.globalState.update('isAuthed', false);
      vscode.window.showInformationMessage('Logged out from GitHub.');
    });
}

module.exports = {logout};