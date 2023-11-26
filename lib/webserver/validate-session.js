const MODULE_NAME = 'WEBSERVER.VALIDATE-SESSION';

const querystring = require('node:querystring');
const urlJoin = require('url-join');
const logger = require('../logger');
const getUserByEmail = require('../get-user-by-email');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns
 */
module.exports = async (req, res, next) => {
  const { xid } = res.locals;
  const { email } = (req.session || {});

  if (!email) {
    req.session.destroy();
    res.redirect('/login');
    return;
  }

  try {
    logger.debug(`${MODULE_NAME} 3B3A68BF: Retrieving user information from database`, {
      xid,
      email,
    });

    const user = await getUserByEmail(xid, email);
    if (!user) {
      logger.verbose(`${MODULE_NAME} F5FED1A9: Missing user from database`, {
        xid,
        email,
      });

      req.session.destroy();
      res.redirect('/login');
      return;
    }

    if (user.disabled) {
      logger.verbose(`${MODULE_NAME} D2A27102: Access from disabled user`, {
        xid,
        email,
      });

      const qs = {
        msg: 'Your user has been disabled!',
      };

      req.session.destroy();
      res.redirect(urlJoin(
        '/login',
        `?${querystring.stringify(qs)}`,
      ));

      return;
    }

    req.session.super = user.super;

    logger.debug(`${MODULE_NAME} 3BFA490F: Session validated`, {
      xid,
      email,
    });

    next();
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 80230251: Exception`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    req.session.destroy();
    res.status(500).json({
      status: 500,
      message: 'Something wrong',
      'trace-id': xid,
    });
  }
};
