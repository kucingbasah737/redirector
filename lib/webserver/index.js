const MODULE_NAME = 'WEBSERVER';

const express = require('express');
const uniqid = require('uniqid');
const logger = require('../logger');
const targetLookup = require('./target-lookup');
const composeTrustProxy = require('./compose-trust-proxies');

const listenPort = Number(process.env.WEB_PORT) || 8080;

module.exports = async () => {
  logger.verbose(`${MODULE_NAME} 8DC78BEA: Starting`);

  if (!listenPort) {
    logger.error(`${MODULE_NAME} 6A5336AC: Undefined process.env.WEB_PORT`);
    process.exit(1);
  }

  const app = express();

  const trustedProxies = await composeTrustProxy();
  logger.verbose(`${MODULE_NAME} 1DFD2897: Trusting proxies`, {
    trustedProxies,
  });
  app.set('trust proxy', trustedProxies);

  app.use((req, res, next) => {
    res.locals.xid = uniqid();

    if (process.env.WEB_USE_CF_CONNECTING_IP && req.get('cf-connecting-ip')) {
      req.ip = req.get('cf-connecting-ip');
    }
    next();
  });

  app.use(targetLookup);

  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      path: req.path,
      message: 'Path not found',
      'trace-id': res.locals.xid,
    });
  });

  app.listen(listenPort, () => {
    logger.info(`${MODULE_NAME} EE08A943: Web server started`, {
      listenPort,
    });
  })
    .on('error', (e) => {
      logger.error(`${MODULE_NAME} 059DA630: Failed to start web server`, {
        eCode: e.code,
        eMessage: e.message || e.toString(),
      });

      process.exit(1);
    });
};
