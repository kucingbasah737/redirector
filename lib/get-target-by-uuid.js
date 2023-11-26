const MODULE_NAME = 'GET-TARGET-BY-UUID';

const TABLE_NAME = 'targets';

const mysql = require('./mysql');
const logger = require('./logger');

/**
 *
 * @param {string} xid
 * @param {string} uuid
 * @param {string} [email]
 * @returns {Promise<import('./get-target').Target>}
 */

module.exports = async (xid, uuid, email) => {
  const values = [
    TABLE_NAME,
  ];

  const conditions = [];

  conditions.push('uuid = ?');
  values.push(uuid);

  if (email) {
    conditions.push('user_email = ?');
    values.push(email);
  }

  const query = `
    SET STATEMENT max_statement_time=100 FOR
    SELECT * FROM ??
    WHERE
      ${conditions.join(' AND ')}
    LIMIT 1
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return (result || [])[0];
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} DF3B60E6: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
