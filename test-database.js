const DB = require('./src/db');

let db = new DB();

db.validateKey('tempkey').then((res) => {
    console.log('Validated Key: ' + res);
})
.catch((err) => {
    console.log(err);
});

