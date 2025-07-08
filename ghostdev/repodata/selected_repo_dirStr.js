//sample array of repos selected by user (coming from frontend)
//const arr = [ "Calendarjs"]

import { readFileSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllRepositories  } from "./get_all_repo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getUsername() {
  const Path = path.join(__dirname, '../keys', 'username.txt');
  const data = readFileSync(Path);
  return data.toString().trim();
}

const username = getUsername()

function getAccessToken() {
  const Path = path.join(__dirname, '../keys', 'access_token.txt');
  const data = readFileSync(Path);
  return data.toString();
}

const accessToken = getAccessToken()

const headers={
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Node.js Script',
    'X-GitHub-Api-Version': '2022-11-28',
}

async function fetchDirectory(selected_repos) {
  var allRepoData = [];
  for(var i=0; i<selected_repos.length ; i++){
    const response = await fetch(`https://api.github.com/repos/${username}/${selected_repos[i]}/branches/main`, {
      headers: headers
    })
    const data = await response.json()
    const treeSHA = data.commit.commit.tree.sha;

    const treeRes = await fetch(`https://api.github.com/repos/${username}/${selected_repos[i]}/git/trees/${treeSHA}?recursive=1`, { headers });
    const treeData = await treeRes.json();
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
        repository: selected_repos[i],
        folders: folders,
        files: files
    });
  };
    return allRepoData
}


export {fetchDirectory};