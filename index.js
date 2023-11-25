const MODULE_NAME = 'MAIN';

process.chdir(__dirname);

require('dotenv').config();

const logger = require('./lib/logger');
const sdNotify = require('./lib/sd-notify');

logger.info(`${MODULE_NAME} 300582D4: Starting`);

const webserver = require('./lib/webserver');

(async () => {
  webserver();

  if (process.env.SYSTEMD_NOTIFY) {
    sdNotify();
  }
})();
