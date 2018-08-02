var express = require('express');
var router = express.Router();



const ACCESS_KEY = 'tempkey';   //TODO replace this with sqlite 

/* GET api data. */
router.post('/', function(req, res, next) {

    if(req.headers['authorization'] !== ACCESS_KEY) {
        res.statusCode = 401;
        res.send('401: Unauthorized');
    } else {
        res.send(`API request received, \nheaders: ${JSON.stringify(req.headers)}\n body: ${JSON.stringify(req.body)}`);
    }
});



router.get('/', (req, res, next) => {
    if(req.headers['authorization'] !== ACCESS_KEY) {
        res.send('401: Unauthorized');
    } else {
        res.send('This route does not accept GET requests.');
    }
});

module.exports = router;
