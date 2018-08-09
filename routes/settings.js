var express = require('express');
var router = express.Router();
var operations = require('../src/instruction-manager');
var DB = require('../src/db');
var db = new DB();
var crypto = require('crypto');

/* GET settings page. */
router.get('/', function(req, res, next) {
  //Ensure they are logged in, TODO check if they are admin
  if(req.session.auth) {
    res.render('settings', {session: req.session});
  } else {
    res.header.continue = '/settings';
    res.redirect('/login');
  }
});

//Create a key
router.post('/keys/create', (req, res, next) => {
  console.log(req.body);
  let sha = crypto.createHash('sha1').update('' + Math.random());
  let key = sha.digest('hex');
  db.insertApiKey('' + key, null, 
    {
      readSensor: req.body.READ_SENSOR == 'on' ? true : false,
      readInstructions: req.body.READ_INSTRUCTIONS == 'on' ? true : false,
      writeInstructions: req.body.WRITE_INSTRUCTIONS == 'on' ? true : false
    }
  ).then(() => {
    res.send('Your key: ' + key);
  }).catch((err) => {
    console.error(err);
  });

  
});

//Create a user
router.post('/users/create', (req, res, next) => {
  if(req.body.newpassword !== req.body.confirm) {
    res.send('Password and confirm password do not match.');
  } else {
    db.generateUser(req.body.newusername, req.body.newpassword, false, 'users').then(() => {
      res.send('Account created.');
    }).catch((err) => {
      res.status = 500;
      res.send(err);
      console.error(err);
    });
  }
});

//Update a user
router.post('/users/modify', (req, res, next) => {
  res.send(req.body);
});

//Delete a user
router.post('/users/delete', (req, res, next) => {
  db.delete('users', DB._eq('username', '' + req.body.username)).then((result) => {
    res.send('Deleted account. ' + result);
  }).catch((err) => {
    console.error(err);
    res.status = 500;
    res.send('Err: ' + err);
  })
});

module.exports = router;
