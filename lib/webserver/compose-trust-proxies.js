const MODULE_NAME = 'WEBSERVER.COMPOSE-TRUST-PROXIES';

const path = require('node:path');
const fs = require('node:fs/promises');
const uniqid = require('uniqid');
const { IP } = require('ip-toolkit');
const logger = require('../logger');

const localCfIPv4Filename = 'data/cf-ipv4.txt';
const localCfIPv6Filename = 'data/cf-ipv6.txt';

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

    const canReadCfIPv4 = await canRead(xid, localCfIPv4Filename);
    const canReadCfIPv6 = await canRead(xid, localCfIPv6Filename);

    const cfIPv4Filename = canReadCfIPv4
      ? localCfIPv4Filename
      : path.join(__dirname, 'cf-ipv4.txt');

    const cfIPv6Filename = canReadCfIPv6
      ? localCfIPv6Filename
      : path.join(__dirname, 'cf-ipv6.txt');

    logger.debug(`${MODULE_NAME} 2E34DDBF: Reading cloudflare ipv4 list`, {
      filename: cfIPv4Filename,
    });

    (await fs.readFile(cfIPv4Filename))
      .toString()
      .split(/\s+/)
      .map((line) => line.trim())
      .filter((line) => line)
      .filter((item) => IP.isCIDR(item) || IP.isValidIP(item))
      .forEach((item) => {
        trusted.push(item);
      });

    logger.debug(`${MODULE_NAME} 2E34DDBF: Reading cloudflare ipv6 list`, {
      filename: cfIPv6Filename,
    });

    (await fs.readFile(cfIPv6Filename))
      .toString()
      .split(/\s+/)
      .map((line) => line.trim())
      .filter((line) => line)
      .filter((item) => IP.isCIDR(item) || IP.isValidIP(item))
      .forEach((item) => {
        trusted.push(item);
      });

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
