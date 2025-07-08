const vscode = require('vscode');
const redis = require('redis');
const { getWebviewContent } = require('../webviews/newRepoWebView.cjs');
const { fetchAllRepositories } = require('../../repodata/get_all_repo.js'); 
const { prompting } = require('../../repodata/llm_gen_dir.js');

async function registerNewRepoCommand(context) {
  const disposable = vscode.commands.registerCommand('ghostdev.newRepo', async function () {
    const repos = await fetchAllRepositories(); // Array of repo names

    const panel = vscode.window.createWebviewPanel(
      'repoName',
      'Create New Repo',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent(repos); // pass repos to HTML builder

    panel.webview.onDidReceiveMessage(
      async message => {
        if (message.type === 'formSubmission') {
          const { name, selectedRepos } = message.payload;
          vscode.window.showInformationMessage(`New repo: ${name}, Selected: ${selectedRepos.join(', ')}`);
          await saveToRedis(message, selectedRepos);
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


async function saveToRedis(message, selectedRepos) {
  const client = redis.createClient({ url: 'redis://localhost:6379' });

  try {
    await client.connect();
    const payload = JSON.stringify(message.payload);
    await client.set('newRepoData', payload);
    const data = await client.get('newRepoData');
    console.log('[Redis] Stored and fetched:', data);
    
    //get suggested directory
    const result = await prompting(client, selectedRepos);
    console.log(result)

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
