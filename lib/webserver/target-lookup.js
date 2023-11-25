const MODULE_NAME = 'WEBSERVER.TARGET-LOOKUP';

const { WEB_USE_CF_CONNECTING_IP } = process.env;

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

  if (WEB_USE_CF_CONNECTING_IP) {
    if (req.get('cf-connecting-ip')) {
      req.ip = req.get('cf-connecting-ip');

      logger.debug(`${MODULE_NAME} 6863BCB6: Request IP tranlated to cf-connecting-ip`, {
        xid,
        originalIp: req.ip,
        cfConnectingIp: req.get('cf-connecting-ip'),
      });
    } else {
      logger.verbose(`${MODULE_NAME} 94264FF4: WEB_USE_CF_CONNECTING_IP buy cf-connecting-ip not defined`, {
        xid,
        headers: req.headers,
      });
    }
  }

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
      reqHeaders: req.headers,
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

    const ipv6 = IPv4.isValidIP(req.ip)
      ? IPv4.toIPv6Format(req.ip).mapped
      : req.ip;

    await insertHit(xid, target.uuid, ipv6, req.get('user-agent'));
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
