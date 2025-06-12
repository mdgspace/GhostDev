const getCodeUrl = "https://github.com/login/device/code"
const getTokenUrl = "https://github.com/login/oauth/access_token"

import { readFileSync, writeFileSync } from 'fs';
function getClientId() {
  const data = readFileSync('../ghostdev/client_id.txt');
  return data.toString();
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
            console.log("Go to this site: https://github.com/login/device/ and enter the code:",user_code); 
            pollForToken(client_id, device_code, result.interval, result.expires_in)
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

                writeFileSync("../ghostdev/access_token.txt", result.access_token);
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

getCode();