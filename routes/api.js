var express = require('express');
var router = express.Router();
var path = require('path');
const DB = require('../src/db');
var db = new DB();

const ACCESS_KEY = 'tempkey';   //TODO replace this with sqlite 

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
router.get('/sensors', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {
        res.send(JSON.stringify([{todo: 'figure out how to get sensor data here'}]));     //TODO
    }).catch((reason) => {
        console.error(reason);
        res.statusCode = 401;
        res.send('401 Unauthorized: ' + reason);
    });
});
router.post('/instructions', (req, res, next) => {
    validateHeader(req.headers).then((validated) => {
        res.send(JSON.stringify([{todo: 'figure out how to get sensor data here'}]));     //TODO
    }).catch((reason) => {
        console.error(reason);
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
