const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.ROUTERS.USERS';

const express = require('express');
const urlJoin = require('url-join');
const logger = require('../../../../../logger');
const forbidIfNotSuper = require('../../forbid-if-not-super-user');
const getUserList = require('../../../../../get-user-list');
const getUserByEmail = require('../../../../../get-user-by-email');
const getTargetList = require('../../../../../get-target-list');
const updatePassword = require('../../../../../update-password');
const getWhitelistedHostnamesForUser = require('../../../../../get-whitelisted-hostnames-for-user');
const getHostnameList = require('../../../../../get-hostname-list');
const insertUserHostname = require('../../../../../insert-user-hostname');
// const getHostnameList = require('../../../../../get-hostname-list');

const router = express.Router();
module.exports = router;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const init = (req, res, next) => {
  res.locals.baseUrl = req.baseUrl;
  next();
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageMain = async (req, res) => {
  const { xid } = res.locals;

  try {
    const users = await getUserList(xid, true, true);
    res.render('users.index.html.njk', {
      pageTitle: 'User List',
      users,
    });
  } catch (e) {
    //
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageView = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const { email } = req.params;

  if (!email) {
    res.redirect(urlJoin(
      req.baseUrl,
      'view',
      currentUser.email,
    ));

    return;
  }

  if (email !== req.session.email && !currentUser?.super) {
    res.status(403).json({
      status: 403,
      message: 'You\'re not authorized to access this resource. Get Away!',
      'trace-id': xid,
    });

    return;
  }

  try {
    const user = await getUserByEmail(xid, email);

    if (!user) {
      res.status(403).json({
        status: 404,
        message: 'User not found',
        'trace-id': xid,
      });

      return;
    }

    const links = await getTargetList(xid, null, email, true);

    const whitelistedHostnames = currentUser.super
      ? await getWhitelistedHostnamesForUser(xid, user.email)
      : null;

    const allHostnames = currentUser.super
      ? (await getHostnameList()).map((item) => item.name)
      : null;

    res.render('users.view.html.njk', {
      pageTitle: user.email,
      user,
      links,
      whitelistedHostnames,
      allHostnames,
    });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 5BFF5E79: Exception on pageView`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: newE.message,
      'trace-id': xid,
    });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageChangePasswordSubmit = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const {
    email: inputEmail,
    newPassword,
    newPasswordConfirmation,
  } = req.body;

  if (inputEmail !== currentUser.email && !currentUser.super) {
    res.status(403).json({
      status: 403,
      message: 'No, you\'re not allowed to change other user password. Wanna play with us?',
      'trace-id': xid,
    });

    return;
  }

  if (newPassword !== newPasswordConfirmation) {
    req.flash('warn', 'Passwords didn\'t match. Please correct it and try again.');
    res.redirect(urlJoin(req.baseUrl, 'view', inputEmail));
    return;
  }

  try {
    await updatePassword(xid, inputEmail, newPassword);

    req.flash('info', 'Password has been changed.');
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 9EADC4F3: Exception on pageChangePasswordSubmit`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
    });

    req.flash('warn', 'Something wrong');
  } finally {
    res.redirect(urlJoin(req.baseUrl, 'view', inputEmail));
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageAddWhitelistSubmit = async (req, res) => {
  const { xid, currentUser } = res.locals;

  if (!currentUser?.super) {
    res.status(403).json({
      status: 403,
      message: 'Forbidden bro',
      'trace-id': xid,
    });

    return;
  }

  const { email, hostname } = req.body;
  if (!email || !hostname) {
    res.status(400).json({
      status: 400,
      message: 'Missing parameter',
      'trace-id': xid,
    });

    return;
  }

  try {
    await insertUserHostname(xid, email, hostname);
    req.flash('info', `${hostname} added to whitelist.`);
  } catch (e) {
    req.flash('warn', `Failed to whitelist "${hostname}". Please check if it's already exists.`);
  } finally {
    res.redirect(urlJoin(
      req.baseUrl,
      'view',
      email,
    ));
  }
};

router.use(init);
router.get('/', forbidIfNotSuper({ redirectUrl: '/dashboard/users/view' }), pageMain);
router.get('/view', pageView);
router.get('/view/:email', pageView);
router.post('/change-password', express.urlencoded({ extended: false }), pageChangePasswordSubmit);
router.post('/add-whitelist', express.urlencoded({ extended: false }), pageAddWhitelistSubmit);
