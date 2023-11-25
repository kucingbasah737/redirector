const MODULE_NAME = 'UPDATE-PASSWORD';

const TABLE_NAME = 'users';

const SALT_ROUND = 10;

const bcrypt = require('bcrypt');
const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} email
 * @param {string} newPassword - plain new password
 * @returns
 */
module.exports = async (xid, email, newPassword) => {
  const query = 'UPDATE ?? SET ? WHERE ?';
  const values = [
    TABLE_NAME,
    {
      password: await bcrypt.hash(newPassword, SALT_ROUND),
    },
    {
      email,
    },
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    logger.verbose(`${MODULE_NAME} 0E085F8D: Password updated`, {
      xid,
      email,
      result,
    });

    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 567B393E: Exception`);

    logger.warn(newE.message, {
      xid,
      email,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
