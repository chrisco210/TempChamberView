//Sets if the database is in production mode.  Set this BEFORE running create-database.js
const PRODUCTION = false;   
//Sets the path of the database.  Don't change unless you know what you are doing.   
const DB_PATH = '.';        

//Do not modify beyond this point
const sqlite = require('sqlite3').verbose();
const fileExists = require('file-exists');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
 
//Permissions
const PERMISSIONS = {
    READ_SENSOR: 1,         //Read data from sensors
    READ_INSTRUCTION: 2,    //Read instructions from queue
    WRITE_INSTRUCTION: 3,        //write instructions to queue.  Also requires authentication in session
};

const SQLITE_DATATYPES = {
    TEXT: 'TEXT',
    INTEGER: 'INTEGER',
    REAL: 'REAL',
    BLOB: 'BLOB',
    BOOL: 'INTEGER'
};


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
     * Currently does not work
     */
    static dbExists() {
        return fileExists(`${DB_PATH}/db-${PRODUCTION ? 'production' : 'testing'}.db`);
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
     * @param {string} tableName the name of the table to insert into
     * @param {value: any, type: string}[]} values the values to insert. can either be a standard sqlite
     * insert string, or an array of the objects shown below, where the type should be one of db.SQLITE_DATATYPES.  
     * Note that passing a string is deprecated, and you should use the array
     * @returns {Promise} the this object of the operation
     */
    insert(tableName, values) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let insertStr = '';

                insertStr += '(';
                //generate an insert string based on the values passed
                for(let i = 0; i < values.length; i++) {
                    switch(values[i].type) {
                        case SQLITE_DATATYPES.BLOB:  
                            insertStr += values[i].value;
                            break;
                        case SQLITE_DATATYPES.INTEGER:
                            insertStr += '' + values[i].value;
                            break;
                        case SQLITE_DATATYPES.REAL:
                            insertStr += '' + values[i].value;
                            break;
                        case SQLITE_DATATYPES.TEXT:
                            insertStr += '\'' + values[i].value + '\'';
                            break;
                        case SQLITE_DATATYPES.BOOL:
                            insertStr += values[i].value ? '1' : '0';
                            break;
                        default:
                            console.error('illegal datatype in insert statement');
                            break;
                    }
                    if(i !== values.length - 1) {
                        insertStr += ',';
                    }
                }
                insertStr += ')';
                
                this.db.run(`INSERT INTO ${tableName} VALUES ${insertStr}`, [], (err) => {
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
     * Format (null where): SELECT resul3tColumn FROM table
     * 
     * @param {string} resultColumn the  
     * @param {string} table 
     * @param {string} where 
     * @returns {Promise<array>} of the this object of the operation
     */
    select(resultColumn, table, where) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                if(where) {
                    this.db.all(`SELECT ${resultColumn} FROM ${table} WHERE ${where}`, [], (err, rows) => {
                        if(err) {
                            reject('Error selecting. op: ' + `SELECT ${resultColumn} FROM ${table} WHERE ${where}. err: ` + err);
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
     * @param {string} apikeytable the table that api keys are stored in
     * @param {{readSensor: boolean, readInstructions: boolean, writeInstructions: boolean}} permissions the permissions to give to api key
     */
    insertApiKey(newApiKey, apikeytable, permissions) {
        return bcrypt.hash(newApiKey, SALT_ROUNDS)
        .then((res) => {
            return this.insert(
                apikeytable === null ? 'apikeys' : apikeytable, 
                [
                    {value: res, type: SQLITE_DATATYPES.TEXT}, 
                    {value: permissions.readSensor, type: SQLITE_DATATYPES.BOOL}, 
                    {value: permissions.readInstructions, type: SQLITE_DATATYPES.BOOL}, 
                    {value: permissions.writeInstructions, type: SQLITE_DATATYPES.BOOL}
                ]
            );
        })
        .catch((err) => {
            console.error('Failed to insert api key. Error: ' + err);
        });
    }

    /**
     * Validate an api key
     * @param {string} apiKey the api key to validate
     * @param {number} permission the permission to check for. Should use PERMISSIONS constant for values
     * @returns {Promise<boolean>} a promise that resolves true if the key is validated. 
     */
    validateKey(apiKey, permission) {
        return new Promise((resolve, reject) => {
            this.select('*', 'apikeys').then((rows) => {
                console.log(rows);
                for(let i = 0; i < rows.length; i++) {
                    if(bcrypt.compareSync(apiKey, rows[i].key)) {       //syncronously compare the hashes, there shouldnt be too many so it should be fine
                        console.log(`Matched ${apiKey} with ${rows[i].key}`);
                        switch(permission) {        //Evaluate if the permission is actually posessed
                            case PERMISSIONS.READ_INSTRUCTION:
                                if(rows[i].READ_INSTRUCTION) {
                                    console.log('Has permission READ_INSTRUCTION');
                                    resolve(true);
                                }
                                break;
                            case PERMISSIONS.READ_SENSOR:
                                if(rows[i].READ_SENSOR) {
                                    console.log('Has permission READ_SENSOR');
                                    resolve(true);
                                }
                                break;
                            case PERMISSIONS.WRITE_INSTRUCTION:
                                if(rows[i].WRITE_INSTRUCTION) {
                                    console.log('Has permission WRITE_INSTRUCTION');
                                    resolve(true);
                                }
                                break;
                            default:
                                console.log(`Unexpected permission with code: ${permission}`);
                                break;
                        }
                        return;
                    }
                }
                console.error('illegal permission');
                reject(false);
                
            });
                
        });
    }

    /**
     * Generate and insert a user given their username, password, if they are an admin, and the table to insert into
     * @param {string} username username
     * @param {string} password unhashed password
     * @param {boolean} isAdmin if they are an admin
     * @param {string} tableName the name of the table
     */
    generateUser(username, password, isAdmin, tableName) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, SALT_ROUNDS).then((hash) => {
                this.insert(tableName, 
                [
                    {value: username, type: SQLITE_DATATYPES.TEXT},
                    {value: hash, type: SQLITE_DATATYPES.TEXT},
                    {value: isAdmin, type: BOOL}
                ]).then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
            
        });
    }

    /**
     * Verify that a password matches the one stored in the database
     * @param {string} username the supplied username
     * @param {string} suppliedPassword the supplied password
     * @returns {Promise<boolean>} resolves if correct, rejects if incorrect
     */
    validatePassword(username, suppliedPassword) {
        return new Promise((resolve, reject) => {
            this.select('password', 'users', `username=\'${username}\'`).then((rows) => {
                bcrypt.compare(suppliedPassword, rows[0].password).then((isCorrect) => {
                    if(isCorrect) {
                        resolve(true);
                    } else {
                        reject('incorrect password');
                    }
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                });
            }).catch((err) => {
                console.error(err);
                reject(err);
            });
        });
    }
}

module.exports = DB;
module.exports.PRODUCTION = PRODUCTION;
module.exports.PERMISSIONS = PERMISSIONS;
module.exports.SQLITE_DATATYPES = SQLITE_DATATYPES;