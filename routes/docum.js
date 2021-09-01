var express = require('express');
var router = express.Router();
const fsPromises = require('fs').promises;
const path = require('path');
const asyncHandler = require('express-async-handler');

/* GET docum. */
router.get('/', asyncHandler(async function (req, res) {
    const filename = path.join(__dirname, '../README.md');
    console.log(filename);
    const readme = await fsPromises.readFile(filename, 'utf8');
    res.render('docum', { readme });
}));
  
module.exports = router;