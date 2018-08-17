var config = require('../src/config');
var DB = require('../src/db');
var db = new DB();


var args = process.argv.slice(2);


var options = {replace: false, production: true, displayHelp: false, invalidArgument: false};

args.forEach((e) => {
    switch(e) {
        case '--help':
            options.displayHelp = true;
            break;
        default:
            options.invalidArgument = {name: e};
            break;
    }
});

if(options.displayHelp) {
    if(invalidArgument) {
        console.log('Invalid argument: ' + options.invalidArgument.name);
    }

    console.log(
        'Usage: node genconfig.js [options]\nArguments:\n--help show help'
    );
    process.exit(0);
}

var genKey;

console.log('Creating database');
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
        genKey = sha.digest('hex');
    } else {    //Generate tempkey
        console.log('Inserting API key tempkey');         
        genKey = '{{api_key_insert}}';
    }
    return db.insertApiKey(genKey, 'apikeys', {readSensor: true, readInstructions: true, writeInstructions: true, }).catch((err) => {
        console.error(err);
    });
})
console.log('Done.');