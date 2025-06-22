//     function getAccessToken() {
//       const data = fs.readFileSync('ghostdev/access_token.txt');
//       return data.toString();
//     }

// const accessToken = getAccessToken()

// const response = await fetch(`https://api.github.com/user`, {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//       }
//     })
//     const data = await response.json()
//     console.log(data.login)


//     const fs = require('fs');

    
//     function getUsername() {
//       const data = fs.readFileSync('ghostdev/username.txt');
//       return data.toString();
//     }
    
//     const username = getUsername()
//     // const accessToken = getAccessToken()
    
    
//     const headers={
//         'Authorization': `Bearer ${accessToken}`,
//         'Accept': 'application/vnd.github+json',
//         'User-Agent': 'Node.js Script',
//         'X-GitHub-Api-Version': '2022-11-28',
//     }
    
//     async function fetchRepositories() {
//         const response = await fetch(`https://api.github.com/repos/D3vanshC/People_status/branches/main`, {
//           headers: headers
//         })
//         const data = await response.json()
//         console.log(data)
//         const treeSHA = data.commit.commit.tree.sha;
//         console.log(`Tree SHA for branch 'main':`, treeSHA);
    
//         const treeRes = await fetch(`https://api.github.com/repos/D3vanshC/People_status/git/trees/${treeSHA}?recursive=1`, { headers });
//         const treeData = await treeRes.json();
//         console.log(`\n📁 Directory structure of People_status:`);
//         treeData.tree?.forEach(item => {
//         console.log(`${item.type === 'tree' ? '📂' : '📄'} ${item.path}`);
//       });
//     }
    
//     fetchRepositories()


//import '../repodata/prompt.js'
//import {fetchDirectory} from '../repodata/repoDirStr.js'
import {directory_analysis} from './tempCodeRunnerFile.js'

import {readFileSync} from 'fs';

function getapikey() {
  const data = readFileSync('api_key.txt');
  return data.toString();
}

const api_key = getapikey()


async function prompting(){
    try {
        const PROJECT_NAME = "Judicify.ai"
        const TECH_STACK = "backend: Expressjs, frontend: React, database: mongodb compass"
        const DESCRIPTION = `Problem Statement : The Indian courts face a significant backlog of pending cases, often resulting in delayed justice. One of the reasons for this is the manual and time-intensive analysis of case histories and legal precedents. Judges and lawyers have to sift through countless records, which consumes valuable time and resources.
At the same time, citizens often struggle to find clear and reliable information about laws, legal rights, and case references without consulting expensive legal experts and lawyers.
This project seeks to bridge these gaps by:
Automating case research to save time for legal professionals
Offering an easy-to-use platform for citizens to access legal knowledge

Detailed abstract solution : The proposed solution is a web-based platform designed to make the process easier by adding relevant parties into a new case. And offering support to citizens who are in need of help related to laws. This platform includes:
Case Room for Judiciary Assistance:
A supervisor (human judge or legal professional) can create a private chat room for specific cases and both parties involved in the case will be given access to this room on an assigned date. Parties can upload case files and evidence securely.
The AI-powered bot will analyze these files and search for similar cases from the past and then the bot will provide a detailed summary of: Relevant case references, Verdicts given in similar situations, and Legal reasoning applied.
The supervisor reviews this information to make an informed and quicker verdict or can give another date for next proceedings. Hence this feature will reduce the average time of delivering justice by leveraging AI-based case research.
 Legal Assistance for Citizens:
A feature for citizens to ask legal questions or seek information about specific laws and cases. Example: “What does Section 498A of the Indian Penal Code cover?”, “Which cases reference the Motor Vehicles Act, 1988?” and others
The AI bot provides clear and concise answers, supported by references to relevant case examples. And authentication will be required to ensure responsible usage and privacy
This website will:
Speed up justice by reducing the time it takes to deliver verdicts in repetitive cases.
Help citizens easily access and understand legal information without the need for expensive legal help.
Support judges and supervisors by reducing their workload, allowing them to focus on more complex cases.
Promoting Transparency: Ensuring fairness by providing reference-based judgments and minimizing biases.
Cost and Time Efficiency: Lowering legal expenses and saving time for courts, litigants, and mediators.
Social Impact: Facilitating faster justice, reducing conflicts, and empowering underserved communities.
This project aims to bridge the gap between technology and law, transforming the way disputes are resolved and justice is delivered.

`
        const DATABASE = "mongodb compass"
        const AUTHENTICATION = "yes-jwt"
        const SPECIFIC_DIFFERENTIATION = "will have costum chatrooms using socket.io which can be joined by only the authorized participants and judges and invites through nodemon"
        const USER_ANALYSIS = await directory_analysis()
        console.log(USER_ANALYSIS)
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
              "content": `You are an exceptionally skilled software development assistant, deeply experienced in designing optimal directory structures for projects. Your expertise in various languages, frameworks, and tooling is unparalleled, and you consistently produce clear, organized, and maintainable layouts.
                  Now, given the following project information, generate only a comma-separated list of file and directory paths enclosed in curly braces, with an additional comment for each file depicting what it is for ***IN ONE LINE*** in the format given. The response must be exactly in the format:
                  {"path/to/file1.ext": "comment_for_file1", "path/to/dir/file2.ext": "comment_for_file2", ... }
                  and EXPLAIN how these example structures which show user's uniqueness (given below as "User’s Unique Directory Making") helped you in making the directory structure.
                  Project Details:
                  - Project Name: ${PROJECT_NAME}
                  - Tech Stack: ${TECH_STACK}
                  Project Scope:
                  - Description: ${DESCRIPTION}  # e.g., “user authentication, real-time chat, payment integration”
                  Technical Requirements:
                  - Database: ${DATABASE}             # e.g., “PostgreSQL”, “MongoDB”, “none”
                  - Authentication: ${AUTHENTICATION} # e.g., “yes - JWT”, “no”
                  Specific:
                  - Unique Aspect: ${SPECIFIC_DIFFERENTIATION}  # e.g., “monorepo with shared components”, “plugin-based modules”, etc.
                  User’s Unique Directory Making: ${USER_ANALYSIS} [IMPORTANT]
                  
                  Instructions:
                  1. Pay special attention to the User’s Unique Directory Making as they reflect the directory making style of the user. However keep in mind the ***rating*** provided and use it as a weight to how much it should affect the currect directory structure. [IMPORTANT]
                  2. See not only the flows of the above mentioned but also the Habits or practices of the user.
                  3. Consider best practices for ${TECH_STACK} and the features listed.
                  4. Reflect the unique aspect ${SPECIFIC_DIFFERENTIATION} in the structure.
                  5. Produce only the list of paths as comma-separated values in curly braces.`
            }
          ]
        })
        });

        const data = await response.json();
        console.log(data.choices[0].message.content)
    } catch (error) {
        console.log(error)
    }
}

prompting();
