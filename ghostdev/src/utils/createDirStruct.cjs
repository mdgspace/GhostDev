const fs = require('fs');
const path = require('path');
const vscode = require('vscode');


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

  vscode.window.showInformationMessage('Project structure created successfully!');
}

module.exports = { generateStructure };
