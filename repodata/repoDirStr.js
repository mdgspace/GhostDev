//sample array of repos selected by user (coming from frontend)
const arr = [ "People_status", "Judicify.ai"]

const fs = require('fs');

function getAccessToken() {
  const data = fs.readFileSync('ghostdev/access_token.txt');
  return data.toString();
}

function getUsername() {
  const data = fs.readFileSync('ghostdev/username.txt');
  return data.toString();
}

const username = getUsername()
const accessToken = getAccessToken()


const headers={
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Node.js Script',
    'X-GitHub-Api-Version': '2022-11-28',
}

async function fetchRepositories() {
  for(var i=0; i<arr.length ; i++){
    const response = await fetch(`https://api.github.com/repos/${username}/${arr[i]}/branches/main`, {
      headers: headers
    })
    const data = await response.json()
    console.log(data)
    const treeSHA = data.commit.commit.tree.sha;
    console.log(`Tree SHA for branch 'main':`, treeSHA);

    const treeRes = await fetch(`https://api.github.com/repos/D3vanshC/People_status/git/trees/${treeSHA}?recursive=1`, { headers });
    const treeData = await treeRes.json();
    console.log(`\n📁 Directory structure of People_status:`);
    treeData.tree?.forEach(item => {
    console.log(`${item.type === 'tree' ? '📂' : '📄'} ${item.path}`);});
    }
}

fetchRepositories()