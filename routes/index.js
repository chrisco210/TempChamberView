var express = require('express');
var router = express.Router();
var operations = require('../src/instruction-manager');

/* GET home page. */
router.get('/', function(req, res, next) {
  //Ensure they are logged in, TODO check if they are admin
  if(req.session.auth) {
    res.render('index', {session: req.session, ops: operations.OPERATIONS});
  } else {
    res.header.continue = '/';
    res.redirect('/login');
  }
  
});

module.exports = router;
