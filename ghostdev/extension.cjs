const vscode = require('vscode');
const { getCode } = require('./repodata/auth.js');
const redis = require('redis');


async function activate(context) {
    console.log('Extension "ghostdev" is now active!');
	
	
    // Auth command
    const disposable = vscode.commands.registerCommand('ghostdev.auth', async function () {
        let user_code = await getCode();
        vscode.window.showInformationMessage(`User code is ${user_code}, go to "https://github.com/login/device/"`);
    });

    // Webview command
    const disposable1 = vscode.commands.registerCommand('ghostdev.newRepo', function () {
        const panel = vscode.window.createWebviewPanel(
            'repoName',
            'Name of the Repo',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();
		async function saveToRedis(message) {
		  const client = redis.createClient({
		    url: 'redis://localhost:6379'
		  });
	  
		  try {
		    await client.connect();
		
		    const payload = JSON.stringify(message.payload);
		
		   // await client.set('newRepoData', payload);
		    const data = await client.get('newRepoData');
			//const data2 = await client.get('newRepoData');
		    console.log('[Redis] Stored and fetched from Redis:', data);
		  } catch (err) {
		    console.error('[Redis] Error:', err.message || err);
		    vscode.window.showErrorMessage(`Redis error: ${err.message || err}`);
		  } finally {
		    try {
		      await client.disconnect();
		      console.log('[Redis] Disconnected successfully');
		    } catch (disconnectErr) {
		      console.error('[Redis] Error while disconnecting:', disconnectErr.message || disconnectErr);
		    }
		  }
		}


        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.type === 'formSubmission') {
                    const { name, desc, techS, auth, db, unique } = message.payload;
                    vscode.window.showInformationMessage(`Form submitted for Repo: ${name}`);
					await saveToRedis(message);
            	
                } else {
                    vscode.window.showInformationMessage(`Unknown message received.`);
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable1);
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>Name your new Repo</h2>
      <input type="text" id="name" />
      <h2>Description</h2>
      <input type="text" id="desc" />
      <h2>Tech Stack</h2>
      <input type="text" id="techS" />
      <h2>Auth (yes/no)</h2>
      <input type="text" id="auth" />
      <h2>Database</h2>
      <input type="text" id="database" />
      <h2>Any unique feature or something else you want to add?</h2>
      <input type="text" id="unique" />
      <br><br>
      <button onclick="submitDetail()">Submit</button>

      <script>
        const vscode = acquireVsCodeApi();

        function submitDetail() {
          const name = document.getElementById('name').value;
          const desc = document.getElementById('desc').value;
          const techS = document.getElementById('techS').value;
          const auth = document.getElementById('auth').value;
          const db = document.getElementById('database').value;
          const unique = document.getElementById('unique').value;

          vscode.postMessage({
            type: 'formSubmission',
            payload: {
              name,
              desc,
              techS,
              auth,
              db,
              unique
            }
          });
        }
      </script>
    </body>
    </html>
  `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
