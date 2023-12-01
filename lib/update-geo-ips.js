const MODULE_NAME = 'UPDATE-GEO-IPS';

const TABLE_NAME = 'geoips';

const mysql = require('./mysql');
const logger = require('./logger');

const touchGeoIp = require('./touch-geo-ip');

module.exports = async (xid) => {
  const query = `
    SELECT ip FROM ??
  `;

  const values = [TABLE_NAME];

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    const resultCount = result.length;
    const promises = [];
    for (let i = 0; i < resultCount; i += 1) {
      const { ip } = result[i];

      const touch = async () => {
        await touchGeoIp(xid, ip);
      };

      promises.push(touch);
    }

    logger.verbose(`${MODULE_NAME} 0C223A06: Waiting for promise all`, {
      xid, resultCount,
    });

    await Promise.all(promises);
    logger.info(`${MODULE_NAME} 1CEF1E7A: All IPs updated`, { xid });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 15A0FD4F: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
