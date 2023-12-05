const MODULE_NAME = 'GET-WHITELISTED_HOSTNAMES_FOR_USER';

const TABLE_NAME = 'user_hostnames';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} email
 * @returns {Promise<string[]>}
 */
module.exports = async (xid, email) => {
  const query = 'SELECT uh.* FROM ?? uh WHERE uh.email = ?';
  const values = [TABLE_NAME, email];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return result.map((item) => item.hostname);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} FBF61DD7: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
