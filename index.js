const MODULE_NAME = 'MAIN';

const logger = require('./lib/logger');
const sdNotify = require('./lib/sd-notify');

logger.info(`${MODULE_NAME} 300582D4: Starting`);

(async () => {
  if (process.env.SYSTEMD_NOTIFY) {
    sdNotify();
  }
})();
