const vscode = require('vscode');
const path = require('path');

function runSmartCommitPython(suggestedMessage) {
  const pythonScript = path.join(__dirname, './suggest_commit.py');

  const safeMessage = `'${suggestedMessage.replace(/'/g, `'\\''`)}'`;

  const terminal = vscode.window.createTerminal('GhostDev Commit Suggest');
  terminal.sendText(`python3 "${pythonScript}" ${safeMessage}`);
  terminal.show();
}

module.exports = { runSmartCommitPython };
