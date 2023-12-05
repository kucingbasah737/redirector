const MODULE_NAME = 'GET-HOSTNAME';

const TABLE_NAME = 'hostnames';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} hostnameName
 * @returns {Promise<import('./get-hostname-list').Hostname>}
 */
module.exports = async (xid, hostnameName) => {
  const query = 'SELECT * FROM ?? h WHERE h.name = ?';
  const values = [TABLE_NAME, hostnameName];

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
