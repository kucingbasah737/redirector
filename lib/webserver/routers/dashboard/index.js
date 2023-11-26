const express = require('express');

const router = express.Router();
module.exports = router;

const pageMain = (req, res) => {
  const { currentUser } = res.locals;

  res.render('template.bootstrap-dashboard-example.html.njk', {
    pageTitle: 'Dashboard',
    showExampleOnTemplate: currentUser.super && (req.query.showExampleOnTemplate !== undefined),
  });
};

router.all('/', pageMain);
