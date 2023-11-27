const MODULE_NAME = 'INSERT-HIT';

const TABLE_NAME = 'hits';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} targetUuid
 * @param {string} ip
 * @param {string} [userAgent]
 * @param {string} [referrer]
 * @param {string} [headers]
 */
module.exports = async (xid, targetUuid, ip, userAgent, referrer, headers) => {
  const query = `
    INSERT INTO ??
    SET
      ?
  `;

  const values = [
    TABLE_NAME,
    {
      target_uuid: targetUuid,
      ip,
      user_agent: userAgent || null,
      referrer: referrer || null,
      headers: (typeof headers === 'string' ? headers : JSON.stringify(headers)) || null,
    },
  ];

  logger.debug(`${MODULE_NAME} 1FA5AE5D: Insert a hit`, {
    xid,
    values,
  });

  try {
    await mysql.poolPromise.query(query, values);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} A3A84051: Exception`);
    logger.warn(newE.message, {
      xid,
      targetUuid,
      ip,
      userAgent,
      referrer,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });
  }
};
