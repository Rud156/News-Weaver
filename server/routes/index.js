var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.json({
        message: 'Hello World'
    });
});

module.exports = router;