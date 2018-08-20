const path = require('path');

//Load configuration
const fs = require('fs');
const hjson = require('hjson');
let config = hjson.parse(fs.readFileSync(path.join(process.cwd(), './config.hjson')).toString());  

//Check for extern secret (for use with public git repos)
if(config.secret.extern) {
    let redactedItems = hjson.parse(fs.readFileSync(config.secret.extern).toString());
    config.secret = redactedItems;
}
console.log('Config:');
console.log(config);


module.exports = config;