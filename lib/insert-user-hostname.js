const MODULE_NAME = 'INSERT-USER-HOSTNAME';

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
  const query = 'INSERT INTO ?? SET ?';
  const values = [
    TABLE_NAME,
    {
      email,
      hostname,
    },
  ];

  try {
    await mysql.poolPromise.query(query, values);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw e;
    }

    const newE = new Error(`${MODULE_NAME} 93DA01BA: Exception`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
