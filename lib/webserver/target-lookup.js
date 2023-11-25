const MODULE_NAME = 'WEBSERVER.TARGET-LOOKUP';

const { IP, IPv4, IPv6 } = require('ip-toolkit');
const getTarget = require('../get-target');
const logger = require('../logger');
const insertHit = require('../insert-hit');

const touchGeoIp = require('../touch-geo-ip');

let hasSendResponse = false;

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
    logger.debug(`${MODULE_NAME} 14BE32D8: Lookup`, {
      xid,
      ip: req.ip,
      isValidIP: IP.isValidIP(req.ip),
      isValidIPv4: IPv4.isValidIP(req.ip),
      isValidIPv6: IPv6.isValidIP(req.ip),
      hostname,
      name,
    });
    const target = await getTarget(xid, hostname, name);

    if (!target || !target.target_url || target.disabled) {
      logger.verbose(`${MODULE_NAME} CCA5AF03: Target not found`, {
        xid,
        ip: req.ip,
        reqHostname: req.hostname,
        reqPath: req.path,
      });

      next();
      return;
    }

    logger.verbose(`${MODULE_NAME} 93A66EE6: Redirecting to target`, {
      xid,
      ip: req.ip,
      reqHostname: req.hostname,
      reqPath: req.path,
      targetUrl: target.target_url,
    });

    res.redirect(301, target.target_url);
    hasSendResponse = true;

    await insertHit(xid, target.uuid, req.ip, req.get('user-agent'));
    await touchGeoIp(xid, req.ip);
  } catch (e) {
    logger.warn(`${MODULE_NAME} 9E4990CC: Exception`, {
      xid,
      hostname,
      path,
      eCode: e.code,
      eMessage: e.message,
    });

    if (!hasSendResponse) {
      res.status(500).json({
        status: 500,
        path: req.path,
        message: 'Oops, something wrong',
        'trace-id': xid,
      });
    }
  }
};
