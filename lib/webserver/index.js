const MODULE_NAME = 'WEBSERVER';

const { WEB_USE_CF_CONNECTING_IP } = process.env;

const express = require('express');
const nunjucks = require('nunjucks');
const uniqid = require('uniqid');
const { default: RedisStore } = require('connect-redis');
const session = require('express-session');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const dayjs = require('dayjs');
const { IP, IPv4 } = require('ip-toolkit');
const { v1: uuidv1 } = require('uuid');

const logger = require('../logger');
const accessLogger = require('./access-logger');
const targetLookup = require('./target-lookup');
const validateSession = require('./validate-session');
const composeTrustProxy = require('./compose-trust-proxies');

const routerDashboard = require('./routers/dashboard');
const routerDumpRequest = require('./routers/dump-request');
const routerLogin = require('./routers/login');
const getAppVersion = require('../get-app-version');
const prepareLocalPublic = require('./prepare-local-public');
const navbar = require('./routers/dashboard/navbar');

const listenPort = Number(process.env.WEB_PORT) || 8080;

module.exports = async () => {
  await getAppVersion();

  logger.verbose(`${MODULE_NAME} 8DC78BEA: Starting`, {
    version: global.appVersion,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
  });

  if (!listenPort) {
    logger.error(`${MODULE_NAME} 6A5336AC: Undefined process.env.WEB_PORT`);
    process.exit(1);
  }

  const app = express();

  app.use(cookieParser());

  app.locals.appName = process.env.APP_NAME || 'REDIRECTOR';
  app.locals.appVersion = global.appVersion;
  app.locals.mainPage = '/dashboard';
  app.locals.template = 'template.bootstrap-dashboard-example.html.njk';
  app.locals.navbar = navbar;

  await prepareLocalPublic();

  if (WEB_USE_CF_CONNECTING_IP) {
    logger.verbose(`${MODULE_NAME} 1A4F8EE0: Will use cf-connecting-ip as requester ip`);
  }

  const trustedProxies = await composeTrustProxy();
  logger.verbose(`${MODULE_NAME} 1DFD2897: Trusting proxies`, {
    trustedProxies,
  });
  app.set('trust proxy', trustedProxies);

  // sessions
  logger.verbose(`${MODULE_NAME} A3F66C95: Initializing session store`);
  const redisClient = redis.createClient();
  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'redirector_8727BC88',
  });

  app.use(session({
    name: process.env.WEB_SESSION_NAME || 'redirector',
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: process.env.WEB_SESSION_SECRET || uniqid(),
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
    },
  }));
  // end of sessions

  app.use((req, res, next) => {
    const xid = uniqid();
    res.locals.xid = xid;
    res.locals.currentHostname = req.hostname;

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

    // unique visitor id
    if (!req.cookies.uvid) {
      res.locals.uvid = uuidv1();
      logger.debug(`${MODULE_NAME} 3CEB38EE: New visitor detected, setting uivd cookie`, {
        xid,
        ip: req.ip,
        uvid: res.locals.uvid,
      });

      req.cookies.uvid = res.locals.uvid;
    }

    next();
  });

  app.use(express.static('./node_modules/bootstrap/dist'));
  app.use(express.static('./public/'));
  app.use(express.static('./public.local/'));

  const nunjucksEnv = nunjucks.configure('views', {
    autoescape: true,
    noCache: !!process.env.WEB_TEMPLATE_NO_CACHE,
    express: app,
  });

  nunjucksEnv.addFilter('simpleDate', (ts) => dayjs(ts).format('YYYY-MM-DD'));
  nunjucksEnv.addFilter('simpleDateTime', (ts) => dayjs(ts).format('YYYY-MM-DD HH:mm:ssZ[Z]'));
  nunjucksEnv.addFilter('convertToIPv4AgainIfItCan', (ipv6) => {
    if (!IP.isValidIP(ipv6)) return ipv6;

    if (ipv6.search(/^::ffff:\d/) < 0) {
      return ipv6;
    }

    const ipv4 = ipv6.replace(/^::ffff:/, '');
    if (!IPv4.isValidIP(ipv4)) return ipv6;

    return ipv4;
  });

  accessLogger(app, 'logs');

  app.get('/', (req, res) => res.redirect(app.locals.mainPage));

  app.use('/dashboard', validateSession, routerDashboard);
  app.use('/dump-request', routerDumpRequest);
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
