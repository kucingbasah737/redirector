const express = require('express');

const router = express.Router();
module.exports = router;

const pageMain = (req, res) => {
  res.render('template.bootstrap-dashboard-example.html.njk', {
    pageTitle: 'Dashboard',
  });
};

router.all('/', pageMain);
