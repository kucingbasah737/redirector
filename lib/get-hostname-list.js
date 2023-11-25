const MODULE_NAME = 'GET-HOSTNAME-LIST';

const TABLE_NAME = 'hostnames';

const mysql = require('./mysql');
const logger = require('./logger');

/**
 * @typedef Hostname
 * @type {object}
 * @property {string} name
 * @property {Date} created
 * @property {number} disabled
 */

/**
 *
 * @param {string} xid
 * @returns {Promise<Hostname[]>}
 */
module.exports = async (xid) => {
  const query = 'SELECT * FROM ??';
  const values = [TABLE_NAME];

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    return result;
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