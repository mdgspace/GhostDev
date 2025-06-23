//sample array of repos selected by user (coming from frontend)
const arr = [ "People_status"]

import { readFileSync } from 'fs';

function getAccessToken() {
  const data = readFileSync('./ghostdev/access_token.txt');
  return data.toString();
}

function getUsername() {
  const data = readFileSync('./ghostdev/username.txt');
  return data.toString();
}

const username = getUsername()
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