const express = require('express');

const router = express.Router();
module.exports = router;

const pageMain = (req, res) => {
  res.end('OK');
};

router.all('/', pageMain);
