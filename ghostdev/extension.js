const vscode = require('vscode');
import {getCode} from '../repodata/auth.js'

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	user_code = await getCode();
	console.log(user_code)
	//context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
