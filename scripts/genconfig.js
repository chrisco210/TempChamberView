//Script to be ran after install
var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);


var options = {replace: false, production: true, displayHelp: false, invalidArgument: false};

args.forEach((e) => {
    switch(e) {
        case '--replace':
            options.replace = true;
            break;
        case '--help':
            options.displayHelp = true;
            break;
        case '--dev':
            options.production = false;
            break;
        default:
            options.invalidArgument = {name: e};
            break;
    }
});

if(options.displayHelp) {
    if(options.invalidArgument) {
        console.log('Invalid argument: ' + options.invalidArgument.name);
    }

    console.log(
        'Usage: node genconfig.js [options]\nArguments:\n--replace replace file if already exists\n--help show help\n--dev generate dev config'
    );
    process.exit(0);
}


var defaultConfig = `{"production":${options.production ? 'true' : 'false'},"api":{"dataEgg":"egg00802fbeaf1b0130","dataSensors":["temperature","humidity","co","no2"]},"database":{"path":"."},"server":{"port":3000},"operations":[{"options":[{"name":"turns","type":"number"}],"name":"settemp","desc":"Set the temperature of the chamber using the number of turns","file":"src/jobs/settemp"},{"options":[],"name":"Calibration","desc":"Run temperature egg calibration routine.","file":"src/jobs/calibrate"},{"options":[{"name":"test1","type":"text"},{"name":"test2","type":"text"}],"name":"test","file":"src/jobs/test.js"}],"secret":{"extern": false, "AQE_API_KEY":"","COOKIE_SECRET":""}}`;

console.log('Creating config file');
if(fs.existsSync(path.join(__dirname, '../config.json')) && !options.replace) {
    console.log('Config already exists. Skipping...');
} else {
    fs.writeFileSync(path.join(__dirname, '../config.json'), defaultConfig, (err) => {
        if(err) {
            console.error(err);
        }
    });
    
}
console.log('Done.');