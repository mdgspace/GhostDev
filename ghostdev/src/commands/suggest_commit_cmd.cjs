// commands/suggestCommit.cjs
const { runSmartCommitPython } = require('../utils/runSmartCommitPython.js');

async function registerSuggestCommitCommand(context) {
  const suggestedCommit = getCommitFromLLM();
  const disposable = vscode.commands.registerCommand('ghostdev.suggestCommit', async () => {
    await runSmartCommitPython(suggestedCommit);
  });

  context.subscriptions.push(disposable);
}

module.exports = { registerSuggestCommitCommand };
