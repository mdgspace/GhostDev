const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const { exec } = require("child_process");


function commentPrefix(filePath) {
  if (filePath.endsWith('.py') || filePath.endsWith('.yml') || filePath.includes('.env')) return '#';
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return '//';
  return '//';
}

async function generateStructure(basePath, structureJson) {
  for (const [filePath, description] of Object.entries(structureJson)) {
    const fullPath = path.join(basePath, filePath);
    const dir = path.dirname(fullPath);

    fs.mkdirSync(dir, { recursive: true });

    const prefix = commentPrefix(filePath);
    const commentLine = `${prefix} ${description}\n`;

    fs.writeFileSync(fullPath, commentLine);
    console.log(`✅ Created: ${fullPath}`);
  }
//initiallizing git
  // const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  //     if (!workspaceRoot) {
  //       vscode.window.showErrorMessage("No workspace folder found!");
  //       return;
  //     }

  exec(`git init`, { cwd: basePath }, (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          vscode.window.showErrorMessage(`Stderr: ${stderr}`);
          return;
        }
        vscode.window.showInformationMessage("Git initiallized");
        console.log(stdout);
      });

  vscode.window.showInformationMessage('Project structure created successfully!');

  // opening the folder
  vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(basePath), false);//false for opening same window me
}

module.exports = { generateStructure };
