const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const composeFullTargetUrl = require('../compose-full-target-url');

/**
 *
 * @param {import('express').Application} app
 * @param {string} logDir
 */
module.exports = (app, logDir) => {
  const stream = rfs.createStream('access.log', {
    // size: '10M', // rotate every 10 MegaBytes written
    interval: '1d', // rotate daily
    // compress: 'gzip' // compress rotated files
    maxFiles: Number(process.env.WEB_KEEP_ACESSS_FILES) || 45,
    path: logDir,
  });

  morgan.token('xid', (req, res) => res.locals.xid || '-');
  morgan.token('email', (req) => req.session?.email || '-');
  // morgan.token('hostname', (req) => req.hostname || '-');
  morgan.token(
    'url',
    /**
     *
     * @param {import('express').Request} req
     * @returns
     */
    (req) => composeFullTargetUrl(req.hostname, req.originalUrl),
  );

  app.use(morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :email :xid',
    {
      stream,
    },
  ));
};
