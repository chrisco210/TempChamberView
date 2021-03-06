var express = require('express');
var router = express.Router();
var DB = require('../src/db');
var db = new DB();
var crypto = require('crypto');
var config = require('../src/config');
var hjson = require('hjson');
var fs = require('fs');
var path = require('path');
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/jobs/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({storage: storage});

/* GET settings page. */
router.get('/', function(req, res, next) {
  //Ensure they are logged in, TODO check if they are admin
  if(req.session.auth) {
    res.render('settings', {session: req.session, config: config, greeting: res.header.greeting ? JSON.parse(res.header.greeting) : null});
    delete res.header.greeting;
  } else {
    res.header.continue = '/settings';
    res.redirect('/login');
  }
});

router.get('/config/edit', (req, res, next) => {
  if(req.session.auth) {
    res.render('configedit', {session: req.session, config: config, greeting: res.header.greeting ? JSON.parse(res.header.greeting) : null});
    delete res.header.greeting;
  } else {
    res.header.continue = '/settings/config/edit';
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
      res.header.greeting = JSON.stringify({message: 'Deleted key', color: 'green'});
      res.redirect('/settings')
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
      res.header.greeting = JSON.stringify({message: 'Passwords do not match', color: 'red'});
      res.redirect('/settings')
    } else {
      db.generateUser(req.body.newusername, req.body.newpassword, false, 'users').then(() => {
        res.header.greeting = JSON.stringify({message: 'Created new user', color: 'green'});
        res.redirect('/settings')
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
        res.header.greeting = JSON.stringify({message: 'Password updated', color: 'green'});
        res.redirect('/settings')
      }).catch((err) => {
        res.status = 500;
        res.send('error: ' + JSON.stringify(err));
      });
    } else {
      res.header.greeting = JSON.stringify({message: 'Passwords do not match', color: 'red'});
      res.redirect('/settings')
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
      res.header.greeting = JSON.stringify({message: 'You cannot delete other users', color: 'red'});
      res.redirect('/settings')
    }
  } else {
    res.status = 403;
    res.send('Deleting users requires auth');
  }
  
});

//Reload the configuration file
router.post('/config/reload', (req, res, next) => {
  if(req.session.auth) {
    config.reload();
    res.header.greeting = JSON.stringify({message: 'Reloaded configuration', color: 'green'});
    res.redirect('/settings')
  } else {
    res.status = 403;
    res.send('Reloading the config requires auth');
  }
});

//Update the configuration
router.post('/config/update', (req, res, next) => {
  if (req.session.auth) {
    console.log('writing new config...');
    fs.writeFileSync(path.join(__dirname, '../config.hjson'), hjson.stringify(JSON.parse(req.body.config)), (err) => {
      if (err) {
        res.status = 500;
        res.send(JSON.stringify(err));
        console.error(err);
      }
    });

    console.log('finished writing new configuration');

    res.header.greeting = JSON.stringify({message: 'Updated configuration', color: 'green'});
    res.redirect('/settings')
  } else {
    res.status = 403;
    res.send('Updating the config requires auth');

  }
});

router.post('/config/newjob', upload.single('script'), (req, res, next) => {
  if(req.session.auth) {
    res.header.greeting = JSON.stringify({message: 'Uploaded file', color: 'green'});
    res.redirect('/settings')
  } else {
    res.status = 403;
    res.send('Uploading new jobs requires auth');
  }
});
module.exports = router;
