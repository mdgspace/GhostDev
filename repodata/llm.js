//import '../repodata/prompt.js'
//import {fetchDirectory} from '../repodata/repoDirStr.js'
import {directory_analysis} from '../repodata/dir_llm.js'

const fs = require('fs');

function getapikey() {
  const data = fs.readFileSync('api_key.txt');
  return data.toString();
}

const api_key = getapikey()


async function prompting(){
    try {
        const PROJECT_NAME = "PizzaGo"
        const TECH_STACK = "backend: Expressjs, frontend: React, database: dbsqlite"
        const DESCRIPTION = "It is a pizza ordering website. It has all basic things like auth, backend frontend connection through api calls. Users can choose from a wide variety of pizzas, and can order them."
        const DATABASE = "dbsqlite"
        const AUTHENTICATION = "yes-jwt"
        const SPECIFIC_DIFFERENTIATION = "nothing specific"
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
                  Now, given the following project information, generate only a comma-separated list of file and directory paths enclosed in curly braces, with no additional commentary, explanation, or formatting. The response must be exactly in the format:
                  { path/to/file1.ext, path/to/dir/file2.ext, ... }
                  and EXPLAIN how these example structures (given below) helped you in making the directory structure.
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