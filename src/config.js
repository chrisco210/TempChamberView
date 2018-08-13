const path = require('path');

//Load configuration
const fs = require('fs');
let config = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config.json')));  

//Check for extern secret (for use with public git repos)
if(config.secret.extern) {
    let redactedItems = JSON.parse(fs.readFileSync(config.secret.extern));
    config.secret = redactedItems;
}
console.log('Config:');
console.log(config);


module.exports = config;