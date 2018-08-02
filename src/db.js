var sqlite = require('sqlite3').verbose();

/**
 * An sqlite database
 */
class DB {
    
    /**
     * Construct an sqlite database
     */
    constructor() {
        this.db = new sqlite.Database('./db');
    }

    /**
     * Create a table in the database
     * @param {string} name the name of the table
     * @param {{name: string, type: string}[]} cols the columns in the table
     * @returns {Promise} a promise containing either the err or the this object
     */
    makeTable(name, cols) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let fields = '';
    
                cols.forEach(element => {
                    if(cols.indexOf(element) == cols.length - 1) {
                        fields += element.name + ' ' + element.type;
                    } else {
                        fields += element.name + ' ' + element.type + ',';
                    }
                });
    
                this.db.run(`CREATE TABLE ${name} (${fields})`, [], (err) => {
                    if(err) {
                        reject(err);
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
     * @param {string} tableName 
     * @param {string} values 
     * @returns {Promise} the this object of the operation
     */
    insert(tableName, values) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`INSERT INTO ${tableName} VALUES ${values}`, [], (err) => {
                    if(err) {
                        reject(err);
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
     * @param {string} resultColumn the  
     * @param {*} table 
     * @param {*} where 
     * @returns {Promise} of the this object of the operation
     */
    select(resultColumn, table, where) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                if(where) {
                    this.db.run(`SELCT ${resultColumn} FROM ${table} WHERE ${where}`, [], (err) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    });
                } else {
                    this.db.run(`SELCT ${resultColumn} FROM ${table}`, [], (err) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    });
                }
                
            });
        });
        
    }
}

module.exports = DB;