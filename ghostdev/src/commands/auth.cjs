const vscode = require('vscode');
const { getCode } = require('../../repodata/auth');

async function registerAuthCommand(context) {
  const disposable = vscode.commands.registerCommand('ghostdev.auth', async function () {
    const user_code = await getCode();
    vscode.window.showInformationMessage(
      `User code is ${user_code}, go to "https://github.com/login/device/"`
    );
  });

  context.subscriptions.push(disposable);
}

module.exports = { registerAuthCommand };
