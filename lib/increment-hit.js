const MODULE_NAME = 'INCREMENT-HIT';

const TABLE_NAME = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, uuid) => {
  const query = 'UPDATE ?? SET hit_count = hit_count + 1 WHERE uuid = ?';
  const values = [
    TABLE_NAME,
    uuid,
  ];

  try {
    await mysql.poolPromise.query(query, values);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} F0667167: Exception`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
