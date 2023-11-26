const MODULE_NAME = 'WEBSERVER.ROUTER-LOGIN';

const querystring = require('node:querystring');
const bcrypt = require('bcrypt');
const express = require('express');
const urlJoin = require('url-join');
const { rateLimit } = require('express-rate-limit');
const logger = require('../../../logger');
const getUserByEmail = require('../../../get-user-by-email');

const router = express.Router();
module.exports = router;

const loginLimiter = rateLimit({
  windowMs: 10 * 5 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: true,

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  message: (req, res) => `Too many attempts, please try again later (trace-id: ${res.locals.xid}).`,

  keyGenerator: (req) => [
    req.ip,
    req.body?.email || null,
  ]
    .filter((item) => item)
    .join('_'),

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @param {import('express-rate-limit').Options} options
   */
  handler: (req, res, next, options) => {
    const { xid } = res.locals;

    res.status(options.statusCode).send(options.message);

    logger.warn(`${MODULE_NAME} CCF244EF: Rate limited triggered`, {
      xid,
      ip: req.ip,
      email: req.body?.email,
      headers: req.headers,
    });
  },

});

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
    res.redirect(res.locals.mainPage);
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

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageLogout = (req, res) => {
  const { xid } = res.locals;

  req.session.destroy((e) => {
    if (e) {
      logger.warn(`${MODULE_NAME} ED2C76F7: Exception on destroying session`, {
        xid,
        eCode: e.code,
        eMessage: e.message || e.toString(),
      });
    }
  });

  res.redirect(res.locals.mainPage);
};

router.get('/', pageLogin);
router.post('/', express.urlencoded({ extended: false }), loginLimiter, pageLoginVerification);
router.get('/out', pageLogout);
