const MODULE_NAME = 'UPDATE-TARGET';

const TABLE_NAME = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 * @typedef NewTargetValues
 * @type {object}
 * @property {string} [name]
 * @property {string} [hostname]
 * @property {string} [user_email]
 * @property {string} [target_url]
 * @property {number} [disabled]
 */
/**
 *
 * @param {string} xid
 * @param {string} uuid
 * @param {NewTargetValues} newValues
 * @returns {Promise<import('mysql2').ResultSetHeader>}
 */
module.exports = async (xid, uuid, newValues) => {
  const query = 'UPDATE ?? SET ? WHERE uuid = ?';
  const values = [
    TABLE_NAME,
    newValues,
    uuid,
  ];

  try {
    logger.verbose(`${MODULE_NAME} 859A85AE: Updating target data`, {
      xid,
      uuid,
      newValues,
    });

    const [result] = await mysql.poolPromise.query(query, values);

    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} EC3ED3EB: Exception`);
    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
