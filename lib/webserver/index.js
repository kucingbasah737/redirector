const MODULE_NAME = 'WEBSERVER';

const { WEB_USE_CF_CONNECTING_IP } = process.env;

const express = require('express');
const nunjucks = require('nunjucks');
const uniqid = require('uniqid');
const logger = require('../logger');
const targetLookup = require('./target-lookup');
const composeTrustProxy = require('./compose-trust-proxies');

const routerLogin = require('./routers/login');

const listenPort = Number(process.env.WEB_PORT) || 8080;

module.exports = async () => {
  logger.verbose(`${MODULE_NAME} 8DC78BEA: Starting`);

  if (!listenPort) {
    logger.error(`${MODULE_NAME} 6A5336AC: Undefined process.env.WEB_PORT`);
    process.exit(1);
  }

  if (WEB_USE_CF_CONNECTING_IP) {
    logger.verbose(`${MODULE_NAME} 1A4F8EE0: Will use cf-connecting-ip as requester ip`);
  }

  const app = express();

  app.use(express.static('./node_modules/bootstrap/dist'));
  app.use(express.static('./public/'));

  nunjucks.configure('views', {
    autoescape: true,
    noCache: !!process.env.WEB_TEMPLATE_NO_CACHE,
    express: app,
  });

  const trustedProxies = await composeTrustProxy();
  logger.verbose(`${MODULE_NAME} 1DFD2897: Trusting proxies`, {
    trustedProxies,
  });
  app.set('trust proxy', trustedProxies);

  app.use((req, res, next) => {
    const xid = uniqid();
    res.locals.xid = xid;

    let { ip } = req;
    if (WEB_USE_CF_CONNECTING_IP) {
      if (req.get('cf-connecting-ip')) {
        logger.debug(`${MODULE_NAME} 6863BCB6: Request IP tranlated to cf-connecting-ip`, {
          xid,
          originalIp: ip,
          cfConnectingIp: req.get('cf-connecting-ip'),
        });

        ip = req.get('cf-connecting-ip');
      } else {
        logger.warn(`${MODULE_NAME} 94264FF4: WEB_USE_CF_CONNECTING_IP but cf-connecting-ip not defined`, {
          xid,
          headers: req.headers,
        });
      }
    }

    res.locals.ip = ip;

    next();
  });

  app.use('/login', routerLogin);

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
