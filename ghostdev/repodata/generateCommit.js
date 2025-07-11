import redis from 'redis';
import fetch from 'node-fetch';
import { fetchCommitHistory } from './fetchCommitHistory.js';

const client = redis.createClient({
  host: 'localhost',
  port: 6379
});
await client.connect();

function getApiKey() {
  const Path = path.join(__dirname, '../keys', 'api_key.txt');
  const data = readFileSync(Path);
  return data.toString();
}

const API_KEY = getApiKey(); 

const gitDiff = await client.get('gitdiff');

if (!gitDiff) {
  console.error('No staged git diff found in Redis under key "gitdiff". Make sure it is populated.');
  process.exit(1);
}

const pastCommits = await fetchCommitHistory();

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that generates git commit messages in the same style as the user’s past commit history.',
    },
    {
      role: 'user',
      content: `These are some of my previous commit messages:\n\n${pastCommits}\n\nAnd this is my current staged git diff:\n\n${gitDiff}\n\nSuggest a new commit message in a similar style. 
      NOTE THAT: ONLY GIVE THE COMMIT MESSAGE IN ONE LINE, NO OTHER COMMENTARY NEEDED`,
    },
  ];
try{
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": messages
          })
        });

        const data = await res.json();
        
        if (data.choices && data.choices.length > 0) {
          
        console.log(data.choices[0].message.content);
        const llm_response = data.choices[0].message.content;
        return(llm_response)
          
        } else {
          console.error('No response from LLM:', data);
        }
        
        await client.disconnect();
}catch(error){
    console.log(error)
        return (error)
}


