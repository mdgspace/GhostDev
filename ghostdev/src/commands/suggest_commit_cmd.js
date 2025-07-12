// commands/suggestCommit.cjs
import {suggestCommitLLM} from '../../repodata/generateCommit.js'
import {runSmartCommitPython} from '../utils/run_py.cjs'
//const { runSmartCommitPython } = require('../utils/run_py.cjs');
//const {suggestCommitLLM} = require('../../repodata/generateCommit.js')
//const {suggestCommitLLM} = require('../../repodata/generateCommit.js');
import path from 'path'
import vscode from 'vscode'

function runPyforGitDiff() {
  const pythonScript = path.join(__dirname, './diff.py');

  //const safeMessage = `'${suggestedMessage.replace(/'/g, `'\\''`)}'`;

  const terminal = vscode.window.createTerminal('Get git diff');
  terminal.sendText(`python3 "${pythonScript}"`);
}

async function registerSuggestCommitCommand(context) {

  runPyforGitDiff();

  const suggestedCommit = await suggestCommitLLM();

  const disposable = vscode.commands.registerCommand('ghostdev.suggestCommit', async () => {
    await runSmartCommitPython(suggestedCommit);
  });

  context.subscriptions.push(disposable);
}

export { registerSuggestCommitCommand };
