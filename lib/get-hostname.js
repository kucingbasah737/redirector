const MODULE_NAME = 'GET-HOSTNAME';

const TABLE_NAME = 'hostnames';
const TABLE_NAME_TARGETS = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} hostnameName
 * @returns {Promise<import('./get-hostname-list').Hostname>}
 */
module.exports = async (xid, hostnameName) => {
  const query = `
    SELECT
      h.*,
      COUNT(1) as target_count
    FROM ?? h
    LEFT JOIN ?? t ON t.hostname = h.name
    WHERE h.name = ?
    GROUP BY h.name
  `.trim();
  const values = [TABLE_NAME, TABLE_NAME_TARGETS, hostnameName];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return (result && result[0]) || null;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} A1E4335C: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
