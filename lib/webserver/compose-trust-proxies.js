const MODULE_NAME = 'WEBSERVER.COMPOSE-TRUST-PROXIES';

const path = require('node:path');
const fs = require('node:fs/promises');
const uniqid = require('uniqid');
const logger = require('../logger');

const CF_LIST_FILENAME = path.join(__dirname, 'cloudflare-ips.txt');

const cfIPv4Filename = 'data/cf-ipv4.txt';
const cfIPv6Filename = 'data/cf-ipv6.txt';

const canRead = async (xid, fileName) => {
  try {
    await fs.access(fileName, fs.constants.R_OK);

    logger.debug(`${MODULE_NAME} 03C3D3BC: We can read this file`, {
      fileName,
    });

    return true;
  } catch (e) {
    logger.verbose(`${MODULE_NAME} 22A940BA: Can not read file`, {
      fileName,
    });

    return false;
  }
};

module.exports = async () => {
  const xid = uniqid();
  try {
    const trusted = [];

    const canReadCfIPv4 = await canRead(xid, cfIPv4Filename);
    const canReadCfIPv6 = await canRead(xid, cfIPv6Filename);

    if (canReadCfIPv4 && canReadCfIPv6) {
      (await fs.readFile(cfIPv4Filename))
        .toString()
        .split(/\s+/)
        .map((line) => line.trim())
        .filter((line) => line)
        .forEach((item) => {
          trusted.push(item);
        });

      (await fs.readFile(cfIPv6Filename))
        .toString()
        .split(/\s+/)
        .map((line) => line.trim())
        .filter((line) => line)
        .forEach((item) => {
          trusted.push(item);
        });
    } else {
      logger.verbose(`${MODULE_NAME} 1409945F: Use built-in cloudflare ip list`, {
        xid,
      });

      (await fs.readFile(CF_LIST_FILENAME))
        .toString()
        .split(/\s+/)
        .map((line) => line.trim())
        .filter((line) => line)
        .forEach((item) => {
          trusted.push(item);
        });
    }

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
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    process.exit(1);
    throw e;
  }
};
