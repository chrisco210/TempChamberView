var express = require('express');
var router = express.Router();
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
  if(req.session.auth) {
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
  } else {
    res.status = 403;
    res.send('Creating keys requires auth');
  }
});

router.post('/keys/delete', (req, res, next) => {
  if(req.session.auth) {
    db.deleteApiKey(req.body.key).then((result) => {
      console.log(result);  
      res.send('Deleted');
    }).catch((err) => {
      console.error(err);
      res.status = 500;
      res.send('Error ' + err);
    })
  } else {
    res.status = 403;
    res.send('Deleting keys requires auth');
  }
});

//Create a user
router.post('/users/create', (req, res, next) => {
  if(req.session.auth) {  
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
  } else {
    res.status = 403;
    res.send('Creating users requires auth');
  }
  
});

//Update a user
router.post('/users/modify', (req, res, next) => {
  console.log('Attempting to modify user');
  if(req.session.auth) {
    if(req.body.newpassword === req.body.confirm) {
      console.log('Updating');
      db.updatePassword(req.session.auth.username, req.body.newpassword).then(() => {
        res.send('Updated password');
      }).catch((err) => {
        res.status = 500;
        res.send('error: ' + JSON.stringify(err));
      });
    } else {
      res.send('Password and confirm password do not match');
    }
  } else {
    res.status = 403;
    res.send('Modifying users requires auth');
  }
});

//Delete a user
router.post('/users/delete', (req, res, next) => {
  if(req.session.auth) {
    if(req.session.auth.username == req.body.username || req.session.auth.username == 'root') {
      db.delete('users', DB._eq('username', '' + req.body.username)).then((result) => {
        res.redirect('/login/logout');
      }).catch((err) => {
        console.error(err);
        res.status = 500;
        res.send('Err: ' + err);
      });
    } else {
      res.status = 403;
      res.send('You cannot delete other users');
    }
  } else {
    res.status = 403;
    res.send('Deleting users requires auth');
  }
  
});

module.exports = router;
