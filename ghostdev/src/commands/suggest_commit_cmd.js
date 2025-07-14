// commands/suggestCommit.cjs
import {suggestCommitLLM} from '../../repodata/generateCommit.js'
import {runSmartCommitPython} from '../utils/run_py.cjs'

import path from 'path'
import vscode from 'vscode'

function runPyforGitDiff() {
  const pythonScript = path.join(__dirname, './diff.py');

  //const safeMessage = `'${suggestedMessage.replace(/'/g, `'\\''`)}'`;

  const terminal = vscode.window.createTerminal('Get git diff');
  terminal.sendText(`python3 "${pythonScript}"`);
}

async function registerSuggestCommitCommand(context) {

  const disposable = vscode.commands.registerCommand('ghostdev.suggestCommit', async () => {
    // Only run Git diff when command is executed
    runPyforGitDiff();
    
    const suggestedCommit = await suggestCommitLLM();
    await runSmartCommitPython(suggestedCommit);
  });

  context.subscriptions.push(disposable);
}

export { registerSuggestCommitCommand };
