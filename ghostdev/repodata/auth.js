const getCodeUrl = "https://github.com/login/device/code"
const getTokenUrl = "https://github.com/login/oauth/access_token"

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// For __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getClientId() {
  const clientIdPath = path.join(__dirname, '../keys', 'client_id.txt');
  const data = readFileSync(clientIdPath);
  return data.toString().trim();
}



async function getCode(){
    const client_id = getClientId();
    const headers = {'Content-Type':'application/json',
        'Accept':'application/json'
    }
    try {
        const response = await fetch(getCodeUrl, {
            statusCode: 200, 
            method: "POST",
            headers: headers,
            body: JSON.stringify({"client_id": client_id, "scope": "repo read:user"})
        });
        if (response.ok) {
            //console.log(response)
            const result = await response.json();
            //console.log(result)
            const device_code = result.device_code;
            const user_code = result.user_code;
            pollForToken(client_id, device_code, result.interval, result.expires_in)
            return user_code
           // console.log("Go to this site: https://github.com/login/device/ and enter the code:",user_code); 
            
        } else {
            const errorData = response.json();
            console.error("error:", errorData);
        }
    } catch (error) {
        console.error("Error", error);
    }
};


async function pollForToken(client_id, device_code, interval = 5, expires_in = 900) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    const startTime = Date.now();

    const poll = async () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed>expires_in){
            console.error("Device code expired. Please restart to authenticate.");
            return;
        }
    


        try {
            const response = await fetch(getTokenUrl, {
                statusCode: 200, 
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                          "client_id": client_id,
                          "device_code": device_code,
                          "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
                    })
            });

            const result = await response.json();

            if (result.access_token) {
                console.log("Access token received!");
                console.log(result);
                const access_token_path = path.join(__dirname, '../keys', 'access_token.txt');
                writeFileSync(access_token_path, result.access_token);
                return;

            } else if (result.error === "authorization_pending"){
                setTimeout(poll, interval*1000);
            } else {
                console.error("error:", result.error)
            }

        } catch (error) {
            console.error("Error", error);
        }
    }
    poll();
}

export { getCode };