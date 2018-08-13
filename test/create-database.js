//Utility to generate a simple testing databse
//to run: node create-database

const DB = require('./src/db');

let db = new DB();


db.makeTable('apikeys', [{name: 'key', type: 'text', primary: true}, 
                        {name: 'READ_SENSOR', type: 'INTEGER'},
                        {name: 'READ_INSTRUCTION', type: 'INTEGER'},
                        {name: 'WRITE_INSTRUCTION', type: 'INTEGER'}
                    ]).then((res) => {
    return db.insertApiKey('tempkey', 'apikeys', {readSensor: true, readInstructions: true, writeInstructions: true});
}).then((res) => {
    return db.select('*', 'apikeys').then((rows) => {
        console.log(rows);
    });
});
db.makeTable('users', [
                       {name: 'username', type: 'TEXT',},
                       {name: 'password', type: 'TEXT',},
                       {name: 'admin', type: 'INTEGER',},
                    ]
).then((res) => {
    return db.generateUser('root', 'password', true, 'users');
})
.then((res) => {
    db.select('*', 'users').then((rows) => {
        console.log(rows);
    });
});