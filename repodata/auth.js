
const getCodeUrl = "https://github.com/login/device/code"

const fs = require('fs');
function getClientId() {
  const data = fs.readFileSync('ghostdev/client_id.txt');
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
            const result = await response.json();
            const device_code = result.device_code;
            const user_code = result.user_code;
            return (user_code)
        } else {
            const errorData = response;
            console.error("error:", errorData);
        }
    } catch (error) {
        console.error("Error", error);
    }
};
async function main() {
  const user_code = await getCode();
  console.log("Go to this site: https://github.com/login/device/ and enter the code:",user_code); 
}

main();