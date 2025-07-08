import { readFileSync, writeFileSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAccessToken() {
  const Path = path.join(__dirname, '../keys', 'access_token.txt');
  const data = readFileSync(Path);
  return data.toString();
}

const accessToken = getAccessToken()


async function fetchAllRepositories() {
  let page = 1;
  const perPage = 100;
  let repositoryNames = [];

  while (true) {
    const response = await fetch(`https://api.github.com/user/repos?affiliation=owner&per_page=${perPage}&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Node.js Script'
      }
    });

     if (!response.ok) {
      console.error(`Error fetching repositories: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();

    if(data.length != 0){
      const Path = path.join(__dirname, '../keys', 'username.txt');
      writeFileSync(Path, data[0].owner.login);
    }
    if (data.length === 0) { 
      break;
    }

    const names = data.map(repo => repo.name);
    repositoryNames = repositoryNames.concat(names);

    page++;
  }

  console.log('Repositories:', repositoryNames);
  return repositoryNames
}

export {fetchAllRepositories};