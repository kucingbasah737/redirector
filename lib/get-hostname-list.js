const MODULE_NAME = 'GET-HOSTNAME-LIST';

const TABLE_NAME = 'hostnames';
const TABLE_NAME_USER_HOSTNAMES = 'user_hostnames';
const TABLE_TARGETS = 'targets';

const { orderBy } = require('hostname-natural-order');

const mysql = require('./mysql');
const logger = require('./logger');

/**
 * @typedef Hostname
 * @type {object}
 * @property {string} name
 * @property {Date} created
 * @property {number} disabled
 * @property {number} exclusive
 * @property {number} target_count
 */

/**
 *
 * @param {string} xid
 * @param {import('./get-user-by-email').User} [user]
 * @returns {Promise<Hostname[]>}
 */
module.exports = async (xid, user) => {
  const conditions = [1];
  const values = [TABLE_NAME, TABLE_TARGETS, TABLE_NAME_USER_HOSTNAMES];

  if (user && !user.super) {
    const subConditions = [0];

    if (!user.only_allowed) {
      subConditions.push('h.exclusive = 0');
    }

    subConditions.push('uh.email = ?');
    values.push(user.email);

    conditions.push(subConditions.join(' OR '));
  }

  const query = `
    SELECT
      h.name, 
      h.*,
      COUNT(1) AS target_count
    FROM ?? h
    LEFT JOIN ?? t ON t.hostname = h.name
    LEFT JOIN ?? uh ON uh.hostname = h.name
    WHERE ${conditions.join(' AND ')}
    GROUP BY h.name
    `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    const sorted = orderBy(
      result,
      (item) => item.name,
    );

    logger.debug(`${MODULE_NAME} BA68B2B2: Got result`, {
      xid,
      user,
      result: sorted,
      query: mysql.formatSimplified(query, values),
    });

    return sorted;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} FA3FCE64: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
