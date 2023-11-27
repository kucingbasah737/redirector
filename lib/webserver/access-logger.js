const MODULE_NAME = 'WEBSERVER-ACCESS-LOGGER';

const fs = require('node:fs');
const morgan = require('morgan');
const morganJson = require('morgan-json');
const rfs = require('rotating-file-stream');
const dayjs = require('dayjs');
const logger = require('../logger');
const composeFullTargetUrl = require('../compose-full-target-url');

/**
 *
 * @param {import('express').Application} app
 * @param {string} logDir
 */
module.exports = (app, logDir) => {
  if (!fs.existsSync(logDir)) {
    logger.verbose(`${MODULE_NAME} C64498AD: Creating log dir`);
    fs.mkdirSync(logDir);
  }
  morgan.token('xid', (req, res) => res.locals.xid || '-');
  morgan.token('email', (req) => req.session?.email || '-');
  morgan.token(
    'url',
    /**
     * @param {import('express').Request} req
     * @returns
     */
    (req) => composeFullTargetUrl(req.hostname, req.originalUrl),
  );
  morgan.token('ts', () => dayjs().format());
  morgan.token('localTs', () => dayjs().format());

  const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :email :xid';
  const formatJson = {
    localDate: ':localTs',
    utcDate: ':ts',
    remoteAddr: ':remote-addr',
    method: ':method',
    url: ':url',
    status: ':status',
    responseTimeInMillisecods: ':response-time',
    responseLength: ':res[content-length]',
    referrer: ':referrer',
    userAgent: ':user-agent',
    appVersion: global.appVersion,
    loginedAs: ':email',
    xid: ':xid',
  };

  const stream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    maxFiles: Number(process.env.WEB_KEEP_ACESSS_FILES) || 45,
    path: logDir,
  });

  const streamJson = rfs.createStream('access.json', {
    interval: '1d', // rotate daily
    maxFiles: Number(process.env.WEB_KEEP_ACESSS_FILES) || 45,
    path: logDir,
  });

  logger.debug(`${MODULE_NAME} 3FF4A486: Registering plain text acccess log`);
  app.use(morgan(
    format,
    {
      stream,
    },
  ));

  logger.debug(`${MODULE_NAME} 7B124148: Registering json access log`);
  app.use(morgan(
    morganJson(formatJson),
    {
      stream: streamJson,
    },
  ));
};
