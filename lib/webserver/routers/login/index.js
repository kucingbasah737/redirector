const MODULE_NAME = 'WEBSERVER.ROUTER-LOGIN';

const querystring = require('node:querystring');
const bcrypt = require('bcrypt');
const express = require('express');
const urlJoin = require('url-join');
const logger = require('../../../logger');
const getUserByEmail = require('../../../get-user-by-email');

const router = express.Router();
module.exports = router;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const onInvalidLogin = (req, res) => {
  const { xid, ip } = res.locals;
  const { email } = req.body;

  logger.verbose(`${MODULE_NAME} 850E0EAC: Invalid user`, {
    xid,
    ip,
    email,
  });

  const qs = {
    msg: 'Invalid login. Please check your username and/or password.',
    email,
  };

  res.redirect(urlJoin(
    req.baseUrl,
    `?${querystring.stringify(qs)}`,
  ));
};

const pageLogin = (req, res) => {
  if (req.session?.email) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login.html.njk', {
    msg: req.query.msg,
    email: req.query.email,
  });
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageLoginVerification = async (req, res) => {
  const { xid, ip } = res.locals;
  const { email, password } = req.body;

  res.locals.email = email;

  if (!email || !password) {
    onInvalidLogin(req, res);
    return;
  }

  try {
    const user = await getUserByEmail(xid, email);
    if (!user) {
      onInvalidLogin(req, res);
      return;
    }

    logger.debug(`${MODULE_NAME} 72B400C0: Checking password`, {
      xid,
      email,
      password: password.replace(/./g, '*'),
      passwordFromDb: user.password,
    });

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      logger.debug(`${MODULE_NAME} 8AFB1430: Password does not match`, {
        xid,
        ip,
        email,
      });

      onInvalidLogin(req, res);
      return;
    }

    logger.info(`${MODULE_NAME} C41BB079: User logged in succesfully`, {
      xid,
      ip,
      email,
    });

    req.session.email = email;
    res.redirect('/dashboard');
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} CFB34BC8: Exception on pageLoginVerification`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Something wrong',
      xid,
    });
  }
};

const pageLogout = (req, res) => {
  delete req.session.email;

  res.redirect('/login');
};

router.get('/', pageLogin);
router.post('/', express.urlencoded({ extended: false }), pageLoginVerification);
router.get('/out', pageLogout);
