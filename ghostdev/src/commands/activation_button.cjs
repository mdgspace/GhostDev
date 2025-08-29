const vscode = require('vscode');

function runGetSuggestion(context) {

  const runCmd = vscode.commands.registerCommand("ghostdev.runFunction", async () => {
    vscode.window.showInformationMessage("Button clicked! Running function...");
    console.log("button pressed");
  });
  context.subscriptions.push(runCmd);


  const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  button.text = "Get Suggestions";
  button.tooltip = "Click to fetch suggestions on current code";
  button.command = "ghostdev.runFunction";
  button.show();

  context.subscriptions.push(button);
}

module.exports = { runGetSuggestion };