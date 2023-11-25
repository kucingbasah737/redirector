const MODULE_NAME = 'INSERT-HIT';

const TABLE_NAME = 'hits';

const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, targetUuid, ip, userAgent) => {
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
      user_agent: userAgent,
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
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });
  }
};