//import '../repodata/prompt.js'
//import {fetchDirectory} from '../repodata/repoDirStr.js'
//
//import { readFileSync } from 'fs';
//
//function getapikey() {
//  const data = readFileSync('api_key.txt');
//  return data.toString();
//}
//
//import { createClient } from 'redis';
//const client = createClient();
//client.on('error', err => console.log('Redis Client Error', err));
//await client.connect();
//
//const gitdiff = await client.get('gitdiff');
//
//const api_key = getapikey()
//
//async function code_suggestions(){
//    try {
//        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//        method: "POST",
//        headers: {
//          "Authorization": `Bearer ${api_key}`,
//          "Content-Type": "application/json"
//        },
//        body: JSON.stringify({
//          "model": "deepseek/deepseek-r1:free",
//          "messages": [
//            {
//              "role": "user",
//              "content": `You are an exceptionally skilled software development assistant, deeply experienced in analyzing `
//            }
//          ]
//        })
//        });
//
//        const data = await response.json();
//        const prompt_response = data.choices[0].message.content;
//        console.log(data.choices[0].message.content)
//        return prompt_response
//        
//    } catch (error) {
//        console.log(error)
//    }
//    
//}
//code_suggestions();
//