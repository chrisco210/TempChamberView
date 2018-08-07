var express = require('express');
var router = express.Router();
var path = require('path');
var DB = require('../src/db');
var db = new DB();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve('public/login.html'));
});

//validate provided creds here
router.post('/', (req, res, next) => {
    let username = req.body.username;
    let pwd = req.body.password;

    db.validatePassword(username, pwd).then((success) => {
        req.session.auth = {authenticated: true, 
                            key: 0,
                            username: username,
                            note: 'This will be relpaced by a more secure auth system',
                        };
        res.redirect('/');      //if authenticated, send to home page
    }).catch((err) => {
        res.send('Failed to authenticate: ' + err);
    });
});

//logout here
router.get('/logout', (req, res, next) => {
    delete req.session.auth;
    res.send('Logged out');
});

module.exports = router;
