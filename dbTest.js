const DB = require('./src/db');
var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database(':memory:');

//db.serialize(() => {
//    db.run("CREATE TABLE lorem (info TEXT)");
// 
//    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//    for (var i = 0; i < 10; i++) {
//        stmt.run("Ipsum " + i);
//    }
//    stmt.finalize();
//      db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//        console.log(row.id + ": " + row.info);
//    });
//    /*
//    db.run('CREATE TABLE test (testField INTEGER)', (err) => {
//        console.log(err, this);
//    });
//    db.run('INSERT INTO test VALUES (1)', (err) => {
//        console.log(err, this);
//    });
//    db.run('SELECT * FROM test', (err) => { 
//        console.log(err, this);
//    });
//    */
//});
//
//
let data = new DB();


console.log('making database');
data.makeTable('apikeys', [{name: 'id', type: 'INTEGER'}, {name: 'key', type: 'TEXT'}])
.then((res) => {
    console.log(res);
})
.catch((err) => {
    console.log(err);
});
