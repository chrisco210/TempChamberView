var express = require('express');
var router = express.Router();
var path = require('path');
const DB = require('../src/db');
const redacted = require('../redacted.js');
const request = require('request');

var db = new DB();

const EGG_SERIAL = 'egg0029fd96831a3060';

router.post('/', function(req, res, next) {
    validateHeader(req.headers).then((validated) => {
        res.send('200: The api key works.  Open in a browser to see documentation.' + validated);
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});

//Recent instructions page
router.get('/instructions', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {
        res.send(JSON.stringify([{todo: 'look into where instructions are to be kept, where does the array go'}]));     //TODO
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});
router.post('/instructions', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {
        res.send(JSON.stringify([{todo: 'look into where instructions are to be kept, where does the array go'}]));     //TODO
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});

//sensor data
/*
router.get('/sensors', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {

        let options = {
            uri: 'https://airqualityegg.wickeddevice.com/api/v1/most-recent/messages/device/egg0029fd96831a3060',
            qs: {
            },
            headers: {
                'accept': 'application/json',
                'Authentication': 'Bearer ' + redacted.AQE_API_KEY,
            }
        };

        request(options).then((received) => {
           
        }).catch((err) => {
            console.error(err);
            res.send(err);
        });
    }).catch((reason) => {
        console.error(JSON.stringify(reason));
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});*/
router.post('/sensors', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {
        let options = {
            method: 'GET',
            uri: 'https://airqualityegg.wickeddevice.com/api/v1/most-recent/messages/device/egg0029fd96831a3060',
            headers: {
                'User-Agent': 'request',
                'Authorization': `Bearer ${redacted.AQE_API_KEY}`,
            }
        };

        request(options, (err, resp, body) => {
            if(err) {
                res.statusCode = 401;
                res.send(resp + body);
            } else {
                console.log(resp);
                console.log(body);
                res.send(body);
            }
        });
    }).catch((reason) => {
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});

//Documentation page
router.get('/', (req, res, next) => {
    res.sendFile(path.resolve('views/api.html'));
});

function validateHeader(headers) {
    return new Promise((resolve, reject) => {
        if(!headers.authorization) {
            reject('missing authorization header');
        } else {
            return db.validateKey(headers.authorization).then((isValidated) => {
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
