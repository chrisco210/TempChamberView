const sqlite = require('sqlite3').verbose();
const fs = require('fs');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const PRODUCTION = false;
const DB_PATH = '.';


/**
 * Class to handle apikey sqlite database
 * Note that all objects reference the same database file
 */
class DB {
    
    /**
     * Construct an sqlite database
     */
    constructor() {
        this.db = new sqlite.Database(`${DB_PATH}/db-${PRODUCTION ? 'production' : 'testing'}.db`);
    }


    /**
     * Check if the database file exists
     * resolves true if it exists, rejects false if it does not
     */
    static dbExists() {
        return new Promise((resolve, reject) => {
            fs.access(`${DB_PATH}/db-${PRODUCTION ? 'production' : 'testing'}.db`, (err) => {
                console.error('Error finding db: ' + (err ? 'true' : 'false'));
                if(err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Create a table in the database
     * @param {string} name the name of the table
     * @param {{name: string, type: string, primary?: boolean, autoincrement?: boolean, nonull?: boolean, unique?: boolean, }[]} cols the columns in the table
     * @returns {Promise} a promise containing either the err or the this object
     */
    makeTable(name, cols) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let fields = '';
    
                cols.forEach(element => {
                    //generate modifier fields for the element
                    let modifiers = '';
                    if(element.primary) {
                        if(element.autoincrement) {
                            modifiers = ' PRIMARY KEY AUTOINCREMENT';
                        } else {
                            modifiers = ' PRIMARY KEY';
                        }
                    } else if(element.unique) {
                        modifiers = ' UNIQUE';
                    } else if(element.nonull) {
                        modifiers = ' NOT NULL';
                    }

                    //generate fields
                    if(cols.indexOf(element) == cols.length - 1) {
                        fields += element.name + ' ' + element.type + modifiers;
                    } else {
                        fields += element.name + ' ' + element.type + modifiers + ',';
                    }
                });
    
                this.db.run(`CREATE TABLE ${name} (${fields})`, [], (err) => {
                    if(err) {
                        reject('Error creating table. op: ' + `CREATE TABLE ${name} (${fields}). err: ` + err);
                    } else {
                        resolve(this);
                    }
                });
            });
        });
    }

    /**
     * Insert into the table 
     * Format: INSERT INTO tableName VALUES values
     * Do not use this for api keys - use insertApiKey
     * @param {string} tableName 
     * @param {string} values 
     * @returns {Promise} the this object of the operation
     */
    insert(tableName, values) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`INSERT INTO ${tableName} VALUES ${values}`, [], (err) => {
                    if(err) {
                        reject('Error inserting into table. op: ' + `INSERT INTO ${tableName} VALUES ${values}. err: ` + err);
                    } else {
                        resolve(this);
                    }
                });
            });
        });
    }

    /**
     * Perform a select query from the database 
     * Format: SELECT resultColumn FROM table WHERE where 
     * Format (null where): SELECT resultColumn FROM table
     * 
     * @param {string} resultColumn the  
     * @param {*} table 
     * @param {*} where 
     * @returns {Promise} of the this object of the operation
     */
    select(resultColumn, table, where) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                if(where) {
                    this.db.all(`SELECT ${resultColumn} FROM ${table} WHERE ${where}`, [], (err, rows) => {
                        if(err) {
                            reject('Error selecting. op: ' + `SELECT ${resultColumn} FROM ${table}. err: ` + err);
                        } else {
                            resolve(rows);
                        }
                    });
                } else {
                    this.db.all(`SELECT ${resultColumn} FROM ${table}`, [], (err, rows) => {
                        if(err) {
                            reject('Error selecting. op: ' + `SELECT ${resultColumn} FROM ${table}. err: ` + err);
                        } else {
                            resolve(rows);
                        }
                    });
                }     
            });
        });   
    }

    /**
     * Use this function to insert an api key into the database
     * @param {string} newApiKey the api key to insert
     */
    insertApiKey(newApiKey) {
        return bcrypt.hash(newApiKey, SALT_ROUNDS)
        .then((res) => {
            return this.insert(apiKey, res);
        })
        .catch((err) => {
            console.error('Failed to insert api key: ' + err);
        });
    }

    validateKey(apiKey) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(apiKey, SALT_ROUNDS)
            .then((res) => {
                this.select('key', 'apikeys', `key = ${res}`)
                .then((res) => {
                    if(res.length === 0) {
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    }
}

module.exports = DB;
module.exports.PRODUCTION;