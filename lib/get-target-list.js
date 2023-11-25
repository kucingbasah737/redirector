const MODULE_NAME = 'GET-TARGET-LIST';

const TABLE_NAME = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} [hostname]
 * @param {string} [email]
 * @param {boolean} includeDisabled
 * @returns {Promise<import('./get-target').Target[]>}
 */
module.exports = async (xid, hostname, email, includeDisabled) => {
  const values = [TABLE_NAME];
  const conditions = [1];

  if (hostname) {
    conditions.push('hostname = ?');
    values.push(hostname);
  }

  if (email) {
    conditions.push('user_email = ?');
    values.push(email);
  }

  if (!includeDisabled) {
    conditions.push('disabled = 0');
  }

  const query = `
    SELECT * FROM ??
    WHERE
      ${conditions.join(' AND ')}
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 50F4A490: Exception`);

    logger.error(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
