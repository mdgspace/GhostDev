//sample array of repos selected by user (coming from frontend)
const arr = [ "People_status"]

import { readFileSync } from "fs";

import path from 'path';
import { fileURLToPath } from 'url';


// For __dirname equivalent in ES Modules
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
const branch = 'main'

const headers={
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Node.js',
    'X-GitHub-Api-Version': '2022-11-28',
}

async function fetchCommitHistory() {
    const ownerCommits = [];
  for(var i=0; i<arr.length ; i++){
    const response = await fetch(`https://api.github.com/repos/${username}/${arr[i]}/commits?sha=${branch}&per_page=100`, {
      headers: headers
    })
    const commits = await response.json()

    for (const commit of commits) {
    if (commit.commit.author.name === username) {
      ownerCommits.push({
        message: commit.commit.message
      });
    }
  }
   console.log(ownerCommits);

  };
  return ownerCommits
}


export {fetchCommitHistory};
// fetchCommitHistory();