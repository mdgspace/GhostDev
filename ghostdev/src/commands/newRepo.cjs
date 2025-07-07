const vscode = require('vscode');
const redis = require('redis');
const { getWebviewContent } = require('../webviews/newRepoWebView.cjs');

async function registerNewRepoCommand(context) {
  const disposable = vscode.commands.registerCommand('ghostdev.newRepo', function () {
    const panel = vscode.window.createWebviewPanel(
      'repoName',
      'Create New Repo',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
      async message => {
        if (message.type === 'formSubmission') {
          const { name } = message.payload;
          vscode.window.showInformationMessage(`Form submitted for Repo: ${name}`);
          await saveToRedis(message);
        } else {
          vscode.window.showWarningMessage('Unknown message received.');
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

async function saveToRedis(message) {
  const client = redis.createClient({ url: 'redis://localhost:6379' });

  try {
    await client.connect();
    const payload = JSON.stringify(message.payload);
    await client.set('newRepoData', payload);
    const data = await client.get('newRepoData');
    console.log('[Redis] Stored and fetched:', data);
  } catch (err) {
    console.error('[Redis] Error:', err.message);
    vscode.window.showErrorMessage(`Redis error: ${err.message}`);
  } finally {
    try {
      await client.disconnect();
      console.log('[Redis] Disconnected from redis.')
    } catch (disconnectErr) {
      console.error('[Redis] Disconnect error:', disconnectErr.message);
    }
  }
}

module.exports = { registerNewRepoCommand };
