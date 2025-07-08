function getWebviewContent(repos = []) {
  const checkboxes = repos.map(repo => `
    <label class="checkbox-option">
      <input type="checkbox" name="repoOption" value="${repo}">
      ${repo}
    </label>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
    }

    h1 {
      color: #ffffff;
      text-align: center;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #9cdcfe;
    }

    input[type="text"] {
      width: 100%;
      padding: 10px;
      background-color: #2d2d2d;
      color: #d4d4d4;
      border: 1px solid #3c3c3c;
      border-radius: 5px;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #007acc;
    }

    .checkbox-group {
      background-color: #2d2d2d;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #3c3c3c;
      max-height: 150px;
      overflow-y: auto;
    }

    .checkbox-option {
      display: block;
      padding: 5px;
      border-radius: 4px;
      cursor: pointer;
      color: #d4d4d4;
    }

    .checkbox-option:hover {
      background-color: #3a3a3a;
    }

    .checkbox-option input {
      margin-right: 10px;
    }

    button {
      background-color: #007acc;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      display: block;
      margin: 30px auto 0;
    }

    button:hover {
      background-color: #005f9e;
    }

    .container {
      max-width: 500px;
      margin: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Create a New Repo</h1>

    <div class="form-group">
      <label for="name">Repo Name</label>
      <input type="text" id="name" placeholder="e.g., awesome-project">
    </div>

    <div class="form-group">
      <label for="desc">Description</label>
      <input type="text" id="desc" placeholder="Short description of your project">
    </div>

    <div class="form-group">
      <label for="techS">Tech Stack</label>
      <input type="text" id="techS" placeholder="e.g., React, Django">
    </div>

    <div class="form-group">
      <label for="auth">Authentication (yes/no)</label>
      <input type="text" id="auth" placeholder="yes or no">
    </div>

    <div class="form-group">
      <label for="database">Database</label>
      <input type="text" id="database" placeholder="e.g., PostgreSQL, Firebase">
    </div>

    <div class="form-group">
      <label for="unique">Unique Feature</label>
      <input type="text" id="unique" placeholder="e.g., AI-powered search">
    </div>

    <div class="form-group">
      <label>Select Existing Repos (optional)</label>
      <div class="checkbox-group" id="repoCheckboxes">
        ${checkboxes || '<span style="color: #888;">No repositories found.</span>'}
      </div>
    </div>

    <button onclick="submitDetail()">Submit</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function submitDetail() {
      const name = document.getElementById('name').value;
      const desc = document.getElementById('desc').value;
      const techS = document.getElementById('techS').value;
      const auth = document.getElementById('auth').value;
      const db = document.getElementById('database').value;
      const unique = document.getElementById('unique').value;

      const checkboxes = document.querySelectorAll('input[name="repoOption"]:checked');
      const selectedRepos = Array.from(checkboxes).map(cb => cb.value);

      vscode.postMessage({
        type: 'formSubmission',
        payload: {
          name,
          desc,
          techS,
          auth,
          db,
          unique,
          selectedRepos
        }
      });
    }
  </script>
</body>
</html>
`;
}

module.exports = { getWebviewContent };
