const vscode = require('vscode');
const path = require('path');

function runSmartCommitPython() {
  const pythonScript = path.join(__dirname, '../scripts/suggest_commit.py'); // adjust path
  const terminal = vscode.window.createTerminal('GhostDev Commit Suggest');
  terminal.sendText(`python3 "${pythonScript}"`);
  terminal.show();
}

module.exports = { runSmartCommitPython };
