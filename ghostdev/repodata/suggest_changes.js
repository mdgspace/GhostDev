//import '../repodata/prompt.js'
//import {fetchDirectory} from '../repodata/repoDirStr.js'
import {directory_analysis} from './dir_analysis_llm.js'

import {readFileSync} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// For __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getapikey() {
  const Path = path.join(__dirname, '../keys', 'api_key.txt');
  const data = readFileSync(Path);
  return data.toString();
}

const api_key = getapikey()

async function get_code_change_suggestion(stdout){
//   const data = await client.get('newRepoData');
    try {
        
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
      "content": `You are an exceptionally skilled software development assistant with deep expertise in refactoring and improving code quality across multiple languages and frameworks.
      
Given the following 'git diff' output, generate alternative suggestions ONLY for the lines of code that are marked as **added** (lines starting with '+').  

Output Format:  
{ "original_line_1": "alternative_suggestion_for_line_1", "original_line_2": "alternative_suggestion_for_line_2", ... }

Instructions:  
1. Only include lines that begin with '+' in the git diff.  
2. For each line, generate a single, more robust or cleaner alternative.  
3. Preserve functionality where applicable, but improve readability, maintainability, or performance.  
4. Respond **only** in the required JSON format with one-line key-value pairs.  

Git Diff which you need to fix; 
${stdout}`
    }
  ]
})
        });

        const result = await response.json();
        console.log(result.choices[0].message.content)
        const llm_response = result.choices[0].message.content
        return (llm_response)
    } catch (error) {
        console.log("suggest_changes me aaya", error)
        return (error)
    }
}

get_code_change_suggestion(`diff --git a/src/middleware/auth.js b/src/middleware/auth.js
index 26b4a89..3124238 100644
--- a/src/middleware/auth.js
+++ b/src/middleware/auth.js
@@ -1 +1,2 @@
-// JWT authentication middleware
\ No newline at end of file
+// JWT authentication middleware
+console.log("badiya se chal jaaye bas")
\ No newline at end of file`)