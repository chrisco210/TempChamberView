const path = require('path');

module.exports = () => {
    const fs = require('fs');

    let rawdata = fs.readFileSync(path.join(process.cwd(), './config.json'));  

    console.log('Loaded configuration file:');
    console.log(rawdata.toString());
    return JSON.parse(rawdata);    
};