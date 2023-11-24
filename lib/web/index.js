const MODULE_NAME = 'WEB';

const express = require('express');
const uniqid = require('uniqid');
const logger = require('../logger');

const listenPort = Number(process.env.WEB_PORT) || 8080;

if (!listenPort) {
  logger.error(`${MODULE_NAME} 6A5336AC: Undefined process.env.WEB_PORT`);
  process.exit(1);
}

const app = express();

app.use((req, res, next) => {
  res.locals.xid = uniqid();
  next();
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
