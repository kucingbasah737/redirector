const MODULE_NAME = 'GET-HITS-PER-DAY';

const TABLE_NAME = 'hits';
const TABLE_NAME_TARGETS = 'targets';

const dayjs = require('dayjs');
const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} [targetUuid]
 * @param {string} [userEmail]
 * @param {number} [maxDays=7]
 * @returns {Promise<object[]>}
 */
module.exports = async (xid, targetUuid, userEmail, maxDays) => {
  const values = [TABLE_NAME];
  const conditions = [1];
  const leftJoins = [];

  if (userEmail) {
    leftJoins.push('LEFT JOIN ?? t ON t.uuid = h.target_uuid');
    values.push(TABLE_NAME_TARGETS);
    conditions.push('t.user_email = ?');
    values.push(userEmail);
  }

  if (targetUuid) {
    conditions.push('h.target_uuid = ?');
    values.push(targetUuid);
  }

  conditions.push('h.created > ?');
  values.push(dayjs().subtract(maxDays || 7, 'day').format('YYYY-MM-DD'));

  const query = `
    SELECT
      DATE(h.created) AS date,
      COUNT(1) AS hitCount
    FROM ?? h
      ${leftJoins && leftJoins.join('\n')}
    WHERE
      ${conditions.join(' AND ')}
    GROUP BY DATE(h.created)
    ORDER BY h.created ASC
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} CC595621: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
