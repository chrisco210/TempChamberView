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
    RUN_INSTRUCTION: 4
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
                    insertStr += _strc(values[i].value, values[i].type);
                    
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
     * @param {string} resultColumn the column to select from
     * @param {string} table the table to select from
     * @param {string} where an sqlite boolean expression
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
     * Update a table in the form UPDATE table SET columnName1 = newValue1, columnName2 = newValue2 ... WHERE where
     * @param {string} table the name of the table to update
     * @param {{columnName: string, newValue: any}[]} setterObject an array of objects containing a column name to update
     * followd by the value to update them to as an sqlite expression
     * @param {string} where an sqlite boolean expression
     */
    update(table, setterObject, where) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let setStr = '';

                for(let i = 0; i < setterObject.length; i++) {
                    setStr += setterObject[i].columnName + ' = ' + setterObject[i].newValue;
                    if(i !== setterObject.length - 1) {
                        setStr += ',';
                    }
                }

                if(where) {
                    console.log(`UPDATE ${table} SET ${setStr} WHERE ${where}`);
                    this.db.all(`UPDATE ${table} SET ${setStr} WHERE ${where}`, (result, err) => {
                        if(err) {
                            console.error(err); 
                            reject(err);
                        } else {
                            console.log(result);
                            resolve(result);
                        }
                    });
                } else {
                    this.db.all(`UPDATE ${table} SET ${setStr}`, (result, err) => {
                        if(err) {
                            console.error(err);
                            reject(err);
                        } else {
                            console.log(result);
                            resolve(result);
                        }
                    });
                }
            });
        });
        
    }

    /**
     * Delete from a table.  Format: DELETE FROM tableName WHERE where
     * @param {string} tableName the name of the table to delete from
     * @param {string} where sqlite boolean expression
     */
    delete(tableName, where) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`DELETE FROM ${tableName} WHERE ${where}`, (result, err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
        
    }

    /**
     * Use this function to insert an api key into the database
     * @param {string} newApiKey the api key to insert
     * @param {string} apikeytable the table that api keys are stored in
     * @param {{readSensor: boolean, readInstructions: boolean, writeInstructions: boolean}} permissions the permissions 
     * to give to api key
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
     * Delete an api key from the table
     * @param {string} toDelete the key to delete
     * @param {string} table the table to delete from
     * @param {string} isHashed if true, you provide the hashed key value.
     */
    deleteApiKey(toDelete, table, isHashed) {
        if(isHashed) {
            return this.delete('apikeys', _eq('key', toDelete));
        } else {
            return this.select('*', 'apikeys').then((rows) => {
                for(let i = 0; i < rows.length; i++) { 
                    if(bcrypt.compareSync(toDelete, rows[i].key.trim())) {       //syncronously compare the hashes, there shouldnt be too many so it should be fine
                        return this.delete('apikeys', _eq('key', rows[i].key));
                    }
                }
                reject(false);
            })
            .catch((err) => {
                console.error(err);
            });
        }
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
                    console.log(`key: ${apiKey} with ${rows[i].key}`);
                    console.log(bcrypt.compareSync(apiKey, rows[i].key));   
                    if(bcrypt.compareSync(apiKey, rows[i].key.trim())) {       //syncronously compare the hashes, there shouldnt be too many so it should be fine
                        console.log(`Matched ${apiKey} with ${rows[i].key}`);
                        
                        switch(permission) {        //Evaluate if the permission is actually posessed
                            //TODO
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
                            case PERMISSIONS.RUN_INSTRUCTION:
                                console.log('Running instruction from stack, DEBUG ONLY');
                                resolve(true);
                                break;
                            default:
                                console.log(`Unexpected permission with code: ${permission}`);
                                break;
                        }
                        return;
                    }
                }
                console.error(`Key ${apiKey} does not have permission ${permission}`);
                reject(false);
                
            })
            .catch((err) => {
                console.error(err);
                reject(false); 
            });
                
        }).catch((err) => {
            console.error(err);
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
        //First check if username is taken
        

        return new Promise((resolve, reject) => {
            this.select('username', 'users', _eq('username', username)).then((rows) => {
                if(rows.length > 0) {
                    reject('Username taken');
                }
            }).catch((err) => {
                console.error(err);
                rejct(err);
                return;
            });

            bcrypt.hash(password, SALT_ROUNDS).then((hash) => {
                this.insert(tableName, 
                [
                    {value: username, type: SQLITE_DATATYPES.TEXT},
                    {value: hash, type: SQLITE_DATATYPES.TEXT},
                    {value: isAdmin, type: SQLITE_DATATYPES.BOOL}
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
     * Update a users password to a new password
     * @param {string} username the username of the user to update
     * @param {string} newPassword the password to update to
     */
    updatePassword(username, newPassword) {
        return new Promise((resolve, reject) =>{
            return bcrypt.hash(newPassword, SALT_ROUNDS).then((hash) => {
                this.update(
                    'users', 
                    [{columnName: 'password', newValue: _strc(hash)}],
                    _eq('username', username)
                ).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                console.error(err);
                reject(err);
            });
        }).catch((err) => {
            console.error(err);
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
            this.select('password', 'users', _eq('username', username)).then((rows) => {
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

/**
 * Convert the given data into a string usable in sqlite strings.
 * @param {string} str the string to convert
 * @param {string} type one of SQLITE_DATATYPES.  If none specified, it assumes SQLITE_DATATYPES.TEXT
*/
function _strc(str, type) {
    switch(type) {
        case SQLITE_DATATYPES.TEXT:
            return `'${str}'`;
        case SQLITE_DATATYPES.INTEGER:
            return '' + str;
        case SQLITE_DATATYPES.REAL:
            return '' + str;
        case SQLITE_DATATYPES.BLOB:
            return '' + str;
        case SQLITE_DATATYPES.BOOL:
            return str ? '1' : '0';
        default:
            return `'${str}'`;
    }
}

/**
 * Generate an equality boolean expression usable in. 
 * Format: columnName = to
 * @param {string} columnName the name of the column to compare to
 * @param {any} to the thing to compare to
 * @param {string} type one of SQLITE_DATATYPES.  If none specified assumes SQLITE_DATATYPES.TEXT
 */
function _eq(columnName, to, type, escape) {
        return `${columnName} = ${_strc(to, type)}`;
    
}

module.exports = DB;
module.exports.PRODUCTION = PRODUCTION;
module.exports.PERMISSIONS = PERMISSIONS;
module.exports.SQLITE_DATATYPES = SQLITE_DATATYPES;
module.exports._strc = _strc;
module.exports._eq = _eq;