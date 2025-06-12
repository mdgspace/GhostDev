import { readFileSync } from "fs";

function getAccessToken() {
  const data = readFileSync('../ghostdev/access_token.txt');
  return data.toString();
}

const accessToken = getAccessToken()


async function fetchRepositories() {
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
    if (data.length === 0) {
      break;
    }

    const names = data.map(repo => repo.name);
    repositoryNames = repositoryNames.concat(names);

    page++;
  }

  console.log('Repositories:', repositoryNames);
}

fetchRepositories();