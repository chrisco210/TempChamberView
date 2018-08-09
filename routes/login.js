var express = require('express');
var router = express.Router();
var DB = require('../src/db');
var db = new DB();



/* GET home page. */
router.get('/', function(req, res, next) { 
    res.render('login', {con: res.header.continue});
});

//validate provided creds here
router.post('/', (req, res, next) => {
    let username = req.body.username;
    let pwd = req.body.password;

    //Sanitize password input


    db.validatePassword(username, pwd).then((success) => {
        req.session.auth = {authenticated: true, 
                            key: 0,
                            username: username,
                        };

        if(!req.body.continue) {
            console.log('Missing continue url');    
        }

        res.redirect(req.body.continue === undefined ? '/' : req.body.continue); 
    }).catch((err) => {
        res.send('Failed to authenticate: ' + err);
    });
});

//logout here`
router.get('/logout', (req, res, next) => {
    delete req.session.auth;
    res.redirect('/login');
});

module.exports = router;
