var production;
if(process.argv.length <= 2) {
    console.log('WARN: Production mode not specified.  Assuming prod');
    production = true;
} else if(process.argv[2] === 'prod'){
   production = true;
} else if(process.argv[2] === 'dev') {
    production = false;
} else {
    console.error('ERROR: illegal environment specification.  Specify either prod or dev.  Ex: npm run install -- prod|dev');
    process.exit(1);
}

//Script to be ran after install
var fs = require('fs');
var path = require('path');
var Mustache = require('mustache');
var crypto = require('crypto');



var defaultConfig = `{"production":${production ? 'true' : 'false'},"api":{"dataEgg":"egg00802fbeaf1b0130","dataSensors":["temperature","humidity","co","no2"]},"database":{"path":"."},"server":{"port":3000},"operations":[{"options":[{"name":"turns","type":"number"}],"name":"settemp","desc":"Set the temperature of the chamber using the number of turns","file":"src/jobs/settemp"},{"options":[],"name":"Calibration","desc":"Run temperature egg calibration routine.","file":"src/jobs/calibrate"},{"options":[{"name":"test1","type":"text"},{"name":"test2","type":"text"}],"name":"test","file":"src/jobs/test.js"}],"secret":{"extern": false, "AQE_API_KEY":"","COOKIE_SECRET":""}}`;

console.log('Creating config file');
if(fs.existsSync(path.join(__dirname, '../config.json'))) {
    console.log('Config already exists. Skipping...');
} else {
    fs.writeFileSync(path.join(__dirname, '../config.json'), defaultConfig, (err) => {
        if(err) {
            console.error(err);
        }
    });
    console.log('Done.');
}

var config = require('../src/config');
var DB = require('../src/db');
var db = new DB();

var genKey;

console.log('Creating database');
new Promise((resolve, reject) => {
    db.makeTable('users', [
        {name: 'username', type: 'TEXT',},
        {name: 'password', type: 'TEXT',},
        {name: 'admin', type: 'INTEGER',},
    ]).then((res) => {
        return db.generateUser('root', 'password', true, 'users');
    }).catch((err) => {
        console.error(err);
    });

    db.makeTable('apikeys', [
        {name: 'key', type: 'text', primary: true}, 
        {name: 'READ_SENSOR', type: 'INTEGER'},
        {name: 'READ_INSTRUCTION', type: 'INTEGER'},
        {name: 'WRITE_INSTRUCTION', type: 'INTEGER'}
    ]).then((res) => {
        if(config.production) {
            let sha = crypto.createHash('sha1').update('' + Math.random());
            let genKey = sha.digest('hex');
        } else {    //Generate tempkey
            console.log('Inserting API key tempkey');         
            genKey = 'tempkey';
        }

        return db.insertApiKey(genKey, 'apikeys', {readSensor: true, readInstructions: true, writeInstructions: true, }).catch((err) => {
            console.error(err);
        });

    }).then((res) => {
        resolve(res);
    }).catch((err) => {
        reject(err);
    });

    console.log('Done.');
}).then((res) => {

    console.log("Key: " + genKey);

    var webindex = fs.readFileSync(path.join(__dirname, '../public/javascripts/webindex.js'));

    var insertIndex = Mustache.render(webindex.toString(), {api_key_insert: genKey});

    fs.writeFileSync(path.join(__dirname, '../public/javascripts/webindex.render.js'), insertIndex);

}).catch((err) => {
    console.error("Error: " + JSON.stringify(err));
});


