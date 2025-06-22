// function getapi const response = fetch("https://openrouter.ai/api/v1/chat/completions", {
//   method: "POST",
//   headers: {
//     "Authorization": "Bearer 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>",
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({
//     "model": "deepseek/deepseek-r1-0528",
//     "messages": [
//       {
//         "role": "user",
//         "content": "What is the meaning of life?"
//       }
//     ]
//   })
// });

// // const data = response.JSON()
// console.log(response)

// const dir_prompt = `You are an exceptionally skilled software development assistant, deeply experienced in designing optimal directory structures for projects. Your expertise in various languages, frameworks, and tooling is unparalleled, and you consistently produce clear, organized, and maintainable layouts.
// Now, given the following project information, generate only a comma-separated list of file and directory paths enclosed in curly braces, with no additional commentary, explanation, or formatting. The response must be exactly in the format:
// { path/to/file1.ext, path/to/dir/file2.ext, ... }
// and nothing else.
// Project Details:
// - Project Name: ${PROJECT_NAME}
// - Tech Stack: ${TECH_STACK}
// Project Scope:
// - Description: ${DESCRIPTION}  # e.g., “user authentication, real-time chat, payment integration”
// Technical Requirements:
// - Database: ${DATABASE}             # e.g., “PostgreSQL”, “MongoDB”, “none”
// - Authentication: ${AUTHENTICATION} # e.g., “yes - JWT”, “no”
// Specific:
// - Unique Aspect: ${SPECIFIC_DIFFERENTIATION}  # e.g., “monorepo with shared components”, “plugin-based modules”, etc.
// User’s Example Structures:
// ${EXAMPLE_STRUCTURES}
// (Here include one or more comma-separated lists in curly braces that reflect directory structures the user or team has used in past projects, e.g., { src/app.js, src/lib/utils.js, tests/test_app.js, ... }, possibly multiple variants.)
// Instructions:
// 1. Consider best practices for ${TECH_STACK} and the features listed.
// 2. Reflect the unique aspect ${SPECIFIC_DIFFERENTIATIO} in the structure.
// 3. Produce only the list of paths as comma-separated values in curly braces.`
const TECH_STACK = "MERN stack, with mongo atlas"
async function prompting(){
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            // "Authorization": "Bearer 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",
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.3-8b-instruct:free",
            "messages": [
              {
                "role": "user",
                "content": `You are an exceptionally skilled software architect and directory-structure designer, with deep expertise in organizing projects for clarity, scalability, and maintainability. Your ability to infer a developer’s preferences from examples and tailor structures to project requirements is unmatched.
Using the information and examples provided, generate only a comma-separated list of file and directory paths enclosed in curly braces, with no additional text, explanation, or formatting. The response must be exactly in this format:
{ path/to/file1.ext, path/to/dir/file2.ext, ... }
Project Details:
- Project Name: Judicify.ai
- Tech Stack: ${TECH_STACK}
Project Scope:
- Main Features: 
Problem Statement : The Indian courts face a significant backlog of pending cases, often resulting in delayed justice. One of the reasons for this is the manual and time-intensive analysis of case histories and legal precedents. Judges and lawyers have to sift through countless records, which consumes valuable time and resources.
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


Technical Requirements:
- Database: MongoDB
- Authentication: JWT verification
Specific:
***
Take this below directory structure as reference for 1 or more tech stacks used in the new project. If any tech stack is new and no reference for that is given, then make the structure of that on your own.
***
NOTE THAT YOU NEED TO MAKE SEPERATE FRONTEND AND BACKEND
User’s Example Structures(Purely just to take refrence for how the user names the files and how it maintanes the architecture, this does not necessarly include all the TECH_STACKS ${TECH_STACK} you need to use to create the directory structure): Directory structure: 
 FinTrack
 FinTrack/.gitignore
 FinTrack/Controllers
 FinTrack/Controllers/AuthController.js
 FinTrack/Controllers/TransController.js
 FinTrack/LLMsuggestions
 FinTrack/LLMsuggestions/aiAPI.js
 FinTrack/Middlewares
 FinTrack/Middlewares/AuthJwt.js
 FinTrack/Middlewares/AuthValidation.js
 FinTrack/Models
 FinTrack/Models/Trans.js
 FinTrack/Models/User.js
 FinTrack/Models/db.js
 FinTrack/README.md
 FinTrack/Routes
 FinTrack/Routes/AuthRouter.js
 FinTrack/Routes/LLMRouter.js
 FinTrack/Routes/TransRouter.js
 FinTrack/View
 FinTrack/View/pages
 FinTrack/View/pages/dashboard.ejs
 FinTrack/View/pages/llmCall.ejs
 FinTrack/View/pages/login.ejs
 FinTrack/View/pages/signup.ejs
 FinTrack/index.js
 FinTrack/package-lock.json
 FinTrack/package.json
 FinTrack/public
 FinTrack/public/Utils
 FinTrack/public/Utils/JwtDecode.js
 FinTrack/public/css
 FinTrack/public/css/dashboard.css
 FinTrack/public/css/signup.css
(Here include one or more comma-separated lists in curly braces that reflect directory structures the user or team has used in past projects, e.g., { src/app.js, src/lib/utils.js, tests/test_app.js, ... }, possibly multiple variants.)
Instructions:
1. Carefully analyze the naming conventions, organization patterns, depth, grouping, and file/function naming style evident in [EXAMPLE_STRUCTURES].
2. For this project’s requirements (Tech Stack, Features, Database, Authentication, Unique Aspect), propose a directory structure that a user with those past structures would likely create.
3. Name files and directories functionally, indicating each file’s purpose (e.g., authController.js, userService.ts, config/database.config.js).
4. Follow best practices for [TECH_STACK], and reflect the Unique Aspect in the layout.
5. Produce only the list of paths as comma-separated values inside curly braces, e.g.:
   { README.md, src/index.js, src/controllers/authController.js, src/services/userService.js, src/models/userModel.js, config/database.config.js, tests/auth.test.js, ... }
6. Do not include any commentary, explanations, or additional formatting—only the comma-separated list in curly braces.
7. Do not just stick to the tech of the the EXAMPLE STRUCTURE. Use all the tech stack mentioned ${TECH_STACK}`
              }
          ]
        })
        });

        const data= await response.json()
        console.log(data.choices)
    } catch (error) {
        console.log(error)
    }
}

prompting()











