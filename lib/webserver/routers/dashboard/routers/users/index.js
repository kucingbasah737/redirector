// const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.ROUTERS.USERS';

const express = require('express');
const forbidIfNotSuper = require('../../forbid-if-not-super-user');
const getUserList = require('../../../../../get-user-list');

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

router.use(init);
router.get('/', forbidIfNotSuper({ redirectUrl: '/dashboard/users/view' }), pageMain);
