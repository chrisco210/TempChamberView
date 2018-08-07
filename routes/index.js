var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //Check to make sure logged in, if not, send them to login
  if(req.session.auth) {
    res.render('index', {session: req.session});
  } else {
    res.redirect('/login');
  }
  
});

module.exports = router;
