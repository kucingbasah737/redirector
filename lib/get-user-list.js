const MODULE_NAME = 'GET-USER-LIST';

const TABLE_NAME = 'users';

const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, includeDisabled) => {
  const values = [TABLE_NAME];
  const conditions = [1];

  if (!includeDisabled) {
    conditions.push('u.disabled = 0');
  }
  const query = `SELECT * FROM ?? u WHERE ${conditions.join(' AND ')}`;

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 6A845956: Exception`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
