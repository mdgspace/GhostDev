
const vscode = require('vscode');
const { getCode } = require('./repodata/auth.js');


async function activate(context) {

	console.log('Congratulations, your extension "ghostdev" is now active!');
	let user_code = await getCode(); 
	const disposable = vscode.commands.registerCommand('ghostdev.auth', function () {
		vscode.window.showInformationMessage(`user code is ${user_code}, go to "https://github.com/login/device/"`);
	});
	console.log("hii")
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
