var express = require('express');
var router = express.Router();
var config = require('../src/config')



/* GET home page. */
router.get('/', function(req, res, next) {
  //Ensure they are logged in, TODO check if they are admin

  if(req.session.auth) {
    res.render('index', {session: req.session, ops: config.operations});
  } else {
    res.header.continue = '/';
    res.redirect('/login');
  }
  
});

module.exports = router;
