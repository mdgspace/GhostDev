# Ghost-Dev VS Code Extension

This document outlines the steps to set up and run this VS Code extension in a development environment.

## Running in Development Mode

Follow these steps to get the extension running locally for development and testing.

### 1. Install Dependencies

First, install the necessary node packages using npm:

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root directory of the project. This file will hold your environment-specific variables.

```
# .env
# Add your environment variables here
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
GEMINI_API_KEY=<your-api-key>
# You can use models other than gemini-2.5-flash, like gemini-2.5-pro
```

### 3. Compile TypeScript

The extension is written in TypeScript and needs to be compiled into JavaScript. Run the following command:

```bash
npm run compile
```

### 4. Add Launch Configuration

To debug the extension within VS Code, you need a launch configuration. Create a `.vscode` folder in the project root if you don't have one, and inside it, create a `launch.json` file with the following content:

```json
{
	// A launch configuration that compiles the extension and then opens it inside a new window
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"args": ["--extensionDevelopmentPath=${workspaceFolder}"],
			"outFiles": ["${workspaceFolder}/out/**/*.js"],
			"preLaunchTask": "npm: compile"
		}
	]
}
```

### 5. Run and Debug

1.  Go to the **Run and Debug** view in the VS Code sidebar (or press `Ctrl+Shift+D`).
2.  Select **Run Extension** from the configuration dropdown at the top.
3.  Press the green play button or `F5` to start debugging.

This will compile the project and open a new "[Extension Development Host]" VS Code window with your extension loaded and running. You can make changes to your code, and they will be reflected after you restart the debugging session.