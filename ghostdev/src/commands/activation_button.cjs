import { get_code_change_suggestion } from '../../repodata/suggest_changes';

const vscode = require('vscode');
const path = require("path");
const { exec } = require("child_process");

function runGetSuggestion(context) {

  const runCmd = vscode.commands.registerCommand("ghostdev.runFunction", async () => {
    vscode.window.showInformationMessage("Button clicked! Running function...");
    console.log("button pressed");


    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage("No workspace folder found!");
      return;
    }
    

    const scriptPath = path.join( vscode.extensions.getExtension("choizz.ghostdev").extensionPath,
  "src",
  "utils",
  "diff.py"
);
    
    //abhi assuming that they have python3 installed
    exec(`python3 "${scriptPath}"`, { cwd: workspaceRoot }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        vscode.window.showErrorMessage(`Stderr: ${stderr}`);
        return;
      }
      vscode.window.showInformationMessage("Git diff output in console", stdout);
      console.log(stdout);

      //call to llm for suggested code
      get_code_change_suggestion(stdout);

    });

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