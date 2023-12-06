const path = require('node:path');
const express = require('express');
const urlJoin = require('url-join');
const navbarAdmin = require('./navbar-admin');

const routerMyLinks = require('./routers/my-links');
const routerUsers = require('./routers/users');
const routerHostnames = require('./routers/hostnames');

const router = express.Router();
module.exports = router;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const defaultInit = (req, res, next) => {
  res.locals.basePath = req.baseUrl;
  res.locals.activePath = path.join(req.baseUrl, req.path);

  if (res.locals.currentUser?.super) {
    res.locals.navbarAdmin = navbarAdmin;
  }

  res.locals.showExampleOnTemplate = res.locals.currentUser.super
    && (req.query.showExampleOnTemplate !== undefined);

  next();
};

const pageMain = (req, res) => {
  // res.render('template.bootstrap-dashboard-example.html.njk', {
  //   pageTitle: 'Dashboard',
  // });

  const { currentUser } = res.locals;

  res.redirect(urlJoin(
    req.baseUrl,
    '/users/view',
    currentUser.email,
  ));
};

router.use(defaultInit);
router.all('/', pageMain);
router.use('/my-links', routerMyLinks);
router.use('/users/', routerUsers);
router.use('/hostnames', routerHostnames);
