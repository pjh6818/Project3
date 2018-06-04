var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('delivery', { title: 'delivery', username:req.session.username, admin:req.session.admin, sale:req.session.sale});
});

module.exports = router;
