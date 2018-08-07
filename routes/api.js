const express = require('express');
const router = express.Router();
const path = require('path');
const DB = require('../src/db');
const redacted = require('../redacted.js');
const request = require('request');
const moment = require('moment');
const instructionMan = require('../src/instruction-manager');

var db = new DB();

var manager = new instructionMan.Manager();


const EGG_SERIAL = 'egg00802fbeaf1b0130';

router.post('/', function(req, res, next) {
    validateHeader(req.headers).then((validated) => {
        res.send('200: The api key works.  Open in a browser to see documentation.' + validated);
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});

//Recent instructions page routes
router.get('/instructions', (req, res, next) => {
    res.send(JSON.stringify(manager.getInstructionStack()));
});
router.post('/instructions/recent', (req, res, next) => {
    validateHeader(req.headers, DB.PERMISSIONS.READ_INSTRUCTION).then((validated) => {
        
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});
router.post('/instructions/push', (req, res, next) => {
    validateHeader(req.headers, DB.PERMISSIONS.WRITE_INSTRUCTION).then((validated) => {
        if(req.session.auth) {
            console.log(req.body);
            res.send('Received instruction push req. ' + req.body);
        } else {
            res.statusCode = 401;
            res.send('You must be signed in to push instructions.');
        }
        
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 400;
        res.send('Error: ' + reason);
    });
});

//sensor data api routes

router.get('/sensors', (req, res, next) => {
    res.send('Use POST to get sensor data');
});
router.post('/sensors', (req, res, next) => {
    validateHeader(req.headers, DB.PERMISSIONS.READ_SENSOR).then((validated) => {

        if(redacted.AQE_API_KEY === undefined) {
            console.error('Undefined api key.  This is most likely unintentional');
        }

        console.log(EGG_SERIAL);

        let options = {
            method: 'GET',
            uri: `https://airqualityegg.wickeddevice.com/api/v1/most-recent/messages/device/${EGG_SERIAL}`,
            headers: {
                'User-Agent': 'request',
                'Authorization': `Bearer ${redacted.AQE_API_KEY}`,
            }
        };

        request(options, (err, resp, body) => {
            if(err) {
                res.statusCode = 400;
                res.send(resp + body);
            } else {
                let parsedBody = JSON.parse(body);

                let sendObj = {data: [], 
                    time: moment().format(),
                    serialNum: parsedBody.serial_num,
                };

                if(parsedBody.error) {      //Check if error encountered in getting data
                    console.error('Error encountered: ' + parsedBody.error);
                    sendObj.error = 'Error encountered: ' + parsedBody.error;
                    res.statusCode = 400;
                } else {
                    ['temperature', 'humidity', 'co', 'no2'].forEach((sensor) => {
                        if(parsedBody[sensor]) {
                            let sensorData = parsedBody[sensor];
                            sendObj.data.push({name: sensor, lastReport: sensorData.date, value: sensorData['converted-value'], units: sensorData['converted-units']});
                        } else {
                            console.error(`Failed to find sensor ${sensor}. Not including`);
                        }
                    });
                }

                

                res.send(sendObj);
            }
        });
    }).catch((reason) => {
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});

//Documentation page
router.get('/', (req, res, next) => {
    res.render('api');
});     

/**
 * Validate that a http header has correct authorization.  Returns a promise that rejects if not validated,
 * and resolves if correctly authenticated
 * @param {any} headers the http header object provided 
 * @param {number} permission the permission to check if the header has.  Should be one of db.PERMISSIONS
 */
function validateHeader(headers, permission) {
    return new Promise((resolve, reject) => {
        if(!headers.authorization) {
            reject('missing authorization header');
        } else {
            return db.validateKey(headers.authorization, permission).then((isValidated) => {
                if(isValidated) {
                    resolve('authenticated');
                } else {
                    reject('invalid api key');
                }
            });
        }
    });
}

module.exports = router;
