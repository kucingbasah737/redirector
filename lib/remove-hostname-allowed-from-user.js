const MODULE_NAME = 'REMOVE-HOSTNAME-ALLOWED-FROM-USER';

const TABLE_NAME = 'user_hostnames';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} email
 * @param {string} hostname
 */
module.exports = async (xid, email, hostname) => {
  const query = 'DELETE FROM ?? WHERE email = ? AND hostname = ?';
  const values = [
    TABLE_NAME,
    email,
    hostname,
  ];

  try {
    await mysql.poolPromise.query(query, values);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} BD23CAF9: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
