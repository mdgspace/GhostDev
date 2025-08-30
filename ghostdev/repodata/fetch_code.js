import { readFileSync } from "fs";
const redis = require('redis');

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

const owner = getUsername()

function getAccessToken() {
  const Path = path.join(__dirname, '../keys', 'access_token.txt');
  const data = readFileSync(Path);
  return data.toString();
}

const accessToken = getAccessToken()

const client = redis.createClient({
 url: 'redis://localhost:6379/'  // No password
});

async function getCodeFromFile(repo, path) {
    try{
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Node.js Script'
            }
        });
        if (response.ok){
            result = await response.json();
            console.log(result)
            (async () => {
             await client.connect();
             await client.set(path, response);
            })();
        } else {
            const errorData = response.json();
            console.error("error:", errorData);
        }
    } catch (error) {
        console.error("Error", error)
    }
}

export {getCodeFromFile}

