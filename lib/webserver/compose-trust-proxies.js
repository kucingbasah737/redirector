const MODULE_NAME = 'WEBSERVER.COMPOSE-TRUST-PROXIES';

const path = require('node:path');
const fs = require('node:fs/promises');
const logger = require('../logger');

const CF_LIST_FILENAME = path.join(__dirname, 'cloudflare-ips.txt');

module.exports = async () => {
  try {
    const trusted = (await fs.readFile(CF_LIST_FILENAME))
      .toString()
      .split(/\s+/)
      .map((line) => line.trim())
      .filter((line) => line);

    if (process.env.WEB_TRUST_PROXY) {
      process.env.WEB_TRUST_PROXY
        .trim()
        .split(/\s*,\s/)
        .forEach((item) => {
          trusted.push(item);
        });
    }

    return trusted;
  } catch (e) {
    logger.warn(`${MODULE_NAME} 674ABA99: Exception`, {
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    process.exit(1);
    throw e;
  }
};
