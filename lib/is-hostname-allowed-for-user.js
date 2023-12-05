const MODULE_NAME = 'IS-HOSTNAME-ALLOWED-FOR-USER';

const TABLE_NAME = 'user_hostnames';

const getHostname = require('./get-hostname');
const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} hostnameName
 * @param {import('./get-user-by-email').User} user
 * @returns {Promise<boolean>}
 */
module.exports = async (xid, hostnameName, user) => {
  if (user.super) return true;

  const query = 'SELECT * FROM ?? WHERE email = ? AND hostname = ?';
  const values = [
    TABLE_NAME,
    user.email,
    hostnameName,
  ];

  try {
    const hostname = await getHostname(xid, hostnameName);

    if (!hostname) return false;
    if (!hostname.exclusive) return true;

    const [result] = await mysql.poolPromise.query(query, values);
    return !!(result && result.length);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} F1C79429: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
