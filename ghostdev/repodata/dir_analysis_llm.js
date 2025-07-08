//import '../repodata/prompt.js'
import {fetchDirectory} from './selected_repo_dirStr.js'

import { readFileSync} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// For __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getapikey() {
  const clientIdPath = path.join(__dirname, '../keys', 'api_key.txt');
  const data = readFileSync(clientIdPath);
  return data.toString().trim();
}


const api_key = getapikey()


async function directory_analysis(selected_repos){
    try {
        const EXAMPLE_STRUCTURES = await fetchDirectory(selected_repos)
        //console.log(EXAMPLE_STRUCTURES)
        const formattedStructures = EXAMPLE_STRUCTURES.map(repo => {
            return `Repository: ${repo.repository}
                Folders: ${repo.folders.length > 0 ? repo.folders.join(', ') : 'None'}
                Files: ${repo.files.length > 0 ? repo.files.join(', ') : 'None'}
                Total Folders: ${repo.folders.length}
                Total Files: ${repo.files.length}`;
            }).join('\n\n---\n\n');
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "user",
              "content": `You are an exceptionally skilled software development assistant, deeply experienced in analyzing and designing optimal directory structures for projects. Your expertise in various languages, frameworks, and tooling is unparalleled.
                  Now, given the following directory information of a particular user, draw out the uniqueness of:
                  1. How organized it is in accordance with the complexity of the project (analyze the complexity of the project through the name of the repo and the names of files.)
                  2. Figure out the tech stack and analyze how much it follows the conventional ways of making directiry structure of those particular tech stack.
                  3. Note: Pay special attention to the tech stack.
                  4. How clear are the files/folders named.
                  5. User Journey & Feature Mapping [IMPORTANT]
                  6. (For more than one Repos as input): What are things common in those repositories?
                  7. IMPORTANT! Rate the repo out of 10 representing how useful the directory structure is for future projects. 
                  7. Any other thing that you think is important an unique for that user.

                DIRECTORY STRUCTURE/S: ${formattedStructures}
                NOTE: There will be a lot of problems with the provided directory structure. Your job is to analyze which style of directory structure is being followed here.
                Now give me a clear and concise overview of all the repos ALLTOGETHER AND NOT SEPERATELY PER REPO analyzing all the above mentioned features.
                NOTE (for more than one repos): GIVE ME A RESPONSE CONSIDERING ALL REPOS PROVIDED AND NOT PER REPO.`
            }
          ]
        })
        });

        const data = await response.json();
        const prompt_response = data.choices[0].message.content;
        console.log(data.choices[0].message.content)
        return prompt_response
        
    } catch (error) {
        console.log(error)
    }
    
}
directory_analysis();

export {directory_analysis};