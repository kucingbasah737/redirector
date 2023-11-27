const MODULE_NAME = 'GET-USER-LIST';

const TABLE_NAME = 'users';
const TABLE_NAME_TARGETS = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {boolean} includeDisabled
 * @returns {Promise<import('./get-user-by-email').User[]>}
 */
module.exports = async (xid, includeDisabled, withTargetCount) => {
  const fields = ['u.*'];
  const values = [];
  const conditions = [1];

  if (withTargetCount) {
    fields.push('(SELECT COUNT(1) FROM ?? t WHERE t.user_email = u.email) AS target_count');
    values.push(TABLE_NAME_TARGETS);
  }

  values.push(TABLE_NAME);

  if (!includeDisabled) {
    conditions.push('u.disabled = 0');
  }

  const query = `
    SELECT ${fields.join(', ')}
    FROM ?? u
    WHERE ${conditions.join(' AND ')}
  `.trim();

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
