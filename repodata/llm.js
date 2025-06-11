//import '../repodata/prompt.js'
import {fetchDirectory} from '../repodata/repoDirStr.js'
async function prompting(){
    const headers = {'Content-Type':'application/json',
        'Accept':'application/json'
    }
    try {
        const PROJECT_NAME = "PizzaGo"
        const TECH_STACK = "backend: Expressjs, frontend: React, database: dbsqlite"
        const DESCRIPTION = "It is a pizza ordering website. It has all basic things like auth, backend frontend connection through api calls. Users can choose from a wide variety of pizzas, and can order them."
        const DATABASE = "dbsqlite"
        const AUTHENTICATION = "yes-jwt"
        const SPECIFIC_DIFFERENTIATION = "nothing specific"
        const EXAMPLE_STRUCTURES = await fetchDirectory()
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
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
                  User’s Example Structures:
                  ${EXAMPLE_STRUCTURES}
            
                  Instructions:
                  1. Pay special attention to the Example Structures as they reflect the directory making style of the user. [IMPORTANT]
                  2. Consider best practices for ${TECH_STACK} and the features listed.
                  3. Reflect the unique aspect ${SPECIFIC_DIFFERENTIATION} in the structure.
                  4. Produce only the list of paths as comma-separated values in curly braces.`
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