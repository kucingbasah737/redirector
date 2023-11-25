const express = require('express');

const router = express.Router();
module.exports = router;

const pageLogin = (req, res) => {
  res.render('login.html.njk', {});
};

router.get('/', pageLogin);
