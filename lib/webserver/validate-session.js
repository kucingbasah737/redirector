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

  logger.debug(`${MODULE_NAME} 3BEA4EF6: Validating`, {
    xid,
    session: req.session,
  });

  if (!email) {
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

      delete req.session.email;
      req.flash('info', 'Please log-in again');
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

      delete req.session.email;
      res.redirect(urlJoin(
        '/login',
        `?${querystring.stringify(qs)}`,
      ));

      return;
    }

    res.locals.currentUser = user;

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

    res.status(500).json({
      status: 500,
      message: 'Something wrong',
      'trace-id': xid,
    });
  }
};
