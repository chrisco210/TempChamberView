//Utility to generate a simple testing databse
//to run: node create-database

const DB = require('./src/db');

let db = new DB();

db.validateKey('tempkey').then((res) => {
    console.log('Validated Key: ' + res);
})
.catch((err) => {
    console.log(err);
});


/*

db.makeTable('apikeys', [{name: 'key', type: 'text', primary: true}]).then((res) => {
    return db.insertApiKey('tempkey', 'apikeys');
}).then((res) => {
    db.select('key', 'apikeys').then((row) => {
        console.log(row); 
    });
});
*/