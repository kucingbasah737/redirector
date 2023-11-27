const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.FORBID-IF-NOT-SUPER-USER';

const logger = require('../../../logger');

/**
 *
 * @param {object} options
 * @param {string} [options.redirectUrl] - redirect to this url on forbidden
 * @returns {import('express').RequestHandler}
 */
module.exports = (options) => (
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  (req, res, next) => {
    const { xid, currentUser } = res.locals;
    if (!currentUser?.super) {
      logger.warn(`${MODULE_NAME} C3415A21: Forbid non super user`, {
        xid,
        currentUser,
        ip: req.ip,
        url: req.originalUrl,
      });

      if (options?.redirectUrl) {
        res.redirect(options.redirectUrl);
      } else {
        res.status(403).json({
          status: 403,
          message: 'Forbidden access',
          'trace-id': xid,
        });
      }

      return;
    }

    next();
  }
);
