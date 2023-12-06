const MODULE_NAME = 'GET-WHITELISTED-USERS-ON-HOSTNAME';

const TABLE_NAME = 'user_hostnames';

const { orderBy } = require('natural-orderby');
const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} hostnameName
 * @returns {Promise<string[]>}
 */
module.exports = async (xid, hostnameName) => {
  const query = 'SELECT uh.email FROM ?? uh WHERE uh.hostname = ?';
  const values = [
    TABLE_NAME,
    hostnameName,
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return orderBy(
      (result || []).map((item) => item.email),
      (item) => item,
    );
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 328ED848: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
