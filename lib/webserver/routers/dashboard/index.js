const path = require('node:path');
const express = require('express');
const navbar = require('./navbar');

const routerMyLinks = require('./routers/my-links');

const router = express.Router();
module.exports = router;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const defaultInit = (req, res, next) => {
  res.locals.template = 'template.bootstrap-dashboard-example.html.njk';
  res.locals.basePath = req.baseUrl;
  res.locals.activePath = path.join(req.baseUrl, req.path);
  res.locals.navbar = navbar;

  res.locals.showExampleOnTemplate = res.locals.currentUser.super
    && (req.query.showExampleOnTemplate !== undefined);

  next();
};

const pageMain = (req, res) => {
  res.render('template.bootstrap-dashboard-example.html.njk', {
    pageTitle: 'Dashboard',

  });
};

router.use(defaultInit);
router.all('/', pageMain);
router.use('/my-links', routerMyLinks);
