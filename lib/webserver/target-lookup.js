const MODULE_NAME = 'WEBSERVER.TARGET-LOOKUP';

const getTarget = require('../get-target');
const logger = require('../logger');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import('express').Handler} next
 */
module.exports = async (req, res, next) => {
  const { xid } = res.locals;
  const { hostname, path } = req;

  const name = (path || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  try {
    const target = await getTarget(xid, hostname, name);

    if (!target || !target.target_url || target.disabled) {
      next();
      return;
    }

    res.redirect(301, target.target_url);
  } catch (e) {
    logger.warn(`${MODULE_NAME} 9E4990CC: Exception`, {
      xid,
      hostname,
      path,
      eCode: e.code,
      eMessage: e.message,
    });

    res.status(500).json({
      status: 500,
      path: req.path,
      message: 'Oops, something wrong',
      'trace-id': xid,
    });
  }
};
