const MODULE_NAME = 'GET-USER-BY-EMAIL';

const TABLE_NAME = 'users';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 * @typedef User
 * @type {object}
 * @property {string} email
 * @property {string} password
 * @property {Date} created
 * @property {Date} ts
 * @property {number} disabled
 * @property {number} super
 * @property {number} [target_count]
 */

/**
 *
 * @param {string} xid
 * @param {string} email
 * @param {boolean} includeDisabled
 * @returns {Promise<User>}
 */
module.exports = async (xid, email, includeDisabled) => {
  const conditions = [];
  const values = [TABLE_NAME];

  conditions.push('email = ?');
  values.push(email);

  if (!includeDisabled) {
    conditions.push('disabled = 0');
  }

  const query = `
    SELECT * FROM ??
    WHERE
      ${conditions.join(' AND ')}
    LIMIT 1
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return (result || [])[0];
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 2B93AED6: Exception`);

    logger.error(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
