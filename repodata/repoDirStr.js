//sample array of repos selected by user (coming from frontend)
const arr = [ "Calendarjs"]

import { readFileSync } from 'fs';

function getAccessToken() {
  const data = readFileSync('../ghostdev/access_token.txt');
  return data.toString();
}

function getUsername() {
  const data = readFileSync('../ghostdev/username.txt');
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

async function fetchDirectory() {
  var allRepoData = [];
  for(var i=0; i<arr.length ; i++){
    const response = await fetch(`https://api.github.com/repos/${username}/${arr[i]}/branches/main`, {
      headers: headers
    })
    const data = await response.json()
    //console.log(data)
    const treeSHA = data.commit.commit.tree.sha;
    //console.log(`Tree SHA for branch 'main':`, treeSHA);

    const treeRes = await fetch(`https://api.github.com/repos/${username}/${arr[i]}/git/trees/${treeSHA}?recursive=1`, { headers });
    const treeData = await treeRes.json();
    //console.log(`\n📁 Directory structure of People_status:`);
    //treeData.tree?.forEach(item => {
    //console.log(`${item.type === 'tree' ? '📂' : '📄'} ${item.path}`);});
    var folders = [];
    var files = [];
    treeData.tree?.forEach(item => {
      if (item.type === 'tree'){
        folders.push(item.path);
        //console.log(item.path)
      } else {
        files.push(item.path);
      }
    })
    allRepoData.push({
        repository: arr[i],
        folders: folders,
        files: files
    });
  }
    
    
    //console.log(folders, files)
    return allRepoData
}

var allRepoData = await fetchDirectory();
console.log(allRepoData) 