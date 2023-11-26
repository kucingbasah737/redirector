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

  const { ip } = res.locals;
  const name = (path || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  try {
    logger.debug(`${MODULE_NAME} 14BE32D8: Lookup`, {
      xid,
      realReqIp: req.ip,
      translatedIp: ip,
      isValidIP: IP.isValidIP(ip),
      isValidIPv4: IPv4.isValidIP(ip),
      isValidIPv6: IPv6.isValidIP(ip),
      hostname,
      name,
      reqHeaders: req.headers,
    });

    const target = await getTarget(xid, hostname, name);

    if (!target || !target.target_url || target.disabled) {
      logger.verbose(`${MODULE_NAME} CCA5AF03: Target not found`, {
        xid,
        ip,
        reqHostname: req.hostname,
        reqPath: req.path,
      });

      next();
      return;
    }

    logger.verbose(`${MODULE_NAME} 93A66EE6: Redirecting to target`, {
      xid,
      ip,
      reqHostname: req.hostname,
      reqPath: req.path,
      targetUrl: target.target_url,
    });

    res.redirect(301, target.target_url);
    hasSendResponse = true;

    const ipv6 = IPv4.isValidIP(ip)
      ? IPv4.toIPv6Format(ip).mapped
      : ip;

    await insertHit(xid, target.uuid, ipv6, req.get('user-agent'), req.get('referer'));
    await touchGeoIp(xid, ipv6);
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
