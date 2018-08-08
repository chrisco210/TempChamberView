var express = require('express');
var router = express.Router();
var operations = require('../src/instruction-manager');
var DB = require('../src/db');
var db = new DB();
var crypto = require('crypto');

/* GET settings page. */
router.get('/', function(req, res, next) {
  //Ensure they are logged in, TODO check if they are admin
  if(req.session.auth && req.session.auth.username == 'root') {
    res.render('settings', {auth: req.session.auth});
  } else {
    res.status = 403;
    res.send('You must be logged as root to access settings');
  }
});

//Create a key
router.post('/keys/create', (req, res, next) => {
  console.log(req.body);
  let sha = crypto.createHash('sha256').update('' + Math.random());

  db.insertApiKey('' + sha.update('hex'), null, 
    {
      readSensor: req.body.READ_SENSOR == 'on' ? true : false,
      readInstructions: req.body.READ_INSTRUCTIONS == 'on' ? true : false,
      writeInstructions: req.body.WRITE_INSTRUCTIONS == 'on' ? true : false
    }
  ).then(() => {
    res.send('Your key: ' + sha.digest('hex'));
  }).catch((err) => {
    console.error(err);
  });

  
});

//Delete a key
router.post('/keys/delete', (req, res, next) => {

});

//Create a user
router.post('/user/create', (req, res, next) => {

});

router.post('/user/modify', (req, res, next) => {

});

router.post('/user/delete', (req, res, next) => {

});

module.exports = router;
