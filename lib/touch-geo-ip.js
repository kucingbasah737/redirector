const MODULE_NAME = 'TOUCH-GEO-IP';

const TABLE_NAME = 'geoips';

const geoIp = require('geoip-lite');

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string|number} ip
 * @returns
 */

module.exports = async (xid, ip) => {
  if (!ip) {
    logger.warn(`${MODULE_NAME} F0261E86: No ip specified`, { xid });
    return;
  }

  const geoIpData = geoIp.lookup(ip);
  if (!geoIpData) {
    logger.verbose(`${MODULE_NAME} 3B77CCB0: Skip updating database because of GeoIP data not found`, { xid, ip });
    return;
  }

  const query = `
    INSERT INTO ??
    SET
      ?
    ON DUPLICATE KEY
    UPDATE ?
  `;

  const valuesToUpdate = {
    // range0: (Array.isArray(geoIpData.range) && geoIpData.range[0]) || null,
    // range1: (Array.isArray(geoIpData.range) && geoIpData.range[1]) || null,
    country: geoIpData.country || null,
    region: geoIpData.region || null,
    eu: geoIpData.eu || null,
    timezone: geoIpData.timezone || null,
    city: geoIpData.city || null,
    latitude: (Array.isArray(geoIpData.ll) && geoIpData.ll[0]) || null,
    longitude: (Array.isArray(geoIpData.ll) && geoIpData.ll[1]) || null,
    metro: geoIpData.metro,
    area: geoIpData.area,
  };

  const valuesToInsert = JSON.parse(JSON.stringify(valuesToUpdate));
  valuesToInsert.ip = ip;

  const values = [
    TABLE_NAME,
    valuesToInsert,
    valuesToUpdate,
  ];

  try {
    logger.debug(`${MODULE_NAME} 94B2AD13: Touch database`, {
      xid,
      valuesToInsert,
    });

    const [result] = await mysql.poolPromise.query(query, values);
    logger.debug(`${MODULE_NAME} 64A288F7: Database touched`, {
      xid,
      result,
    });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 27A237B8: Exception`);

    logger.error(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      valuesToInsert,
      query: mysql.formatSimplified(query, values),
    });
  }
};
