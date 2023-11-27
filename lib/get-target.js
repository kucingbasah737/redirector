const MODULE_NAME = 'GET-TARGET';

const TABLE_NAME = 'targets';

const mysql = require('./mysql');
const logger = require('./logger');

/**
 * @typedef Target
 * @type {object}
 * @property {string} uuid
 * @property {string} name
 * @property {string} hostname
 * @property {string} full_url
 * @property {string} user_email
 * @property {Date} created
 * @property {string} target_url
 * @property {number} disabled
 * @property {number} hit_count
 * @property {string} last_hit_uuid
 * @property {Date} last_hit_ts
 * @property {string} last_hit_ip
 * @property {string} last_hit_headers
 * @property {string} last_hit_country
 * @property {string} last_hit_region
 * @property {number} last_hit_eu
 * @property {string} last_hit_timezone
 * @property {string} last_hit_city
 * @property {number} last_hit_latitude
 * @property {number} last_hit_longitude
 * @property {string} last_hit_metro
 * @property {number} last_hit_area
 */

/**
 *
 * @param {string} [xid]
 * @param {string} hostname
 * @param {string} name
 * @returns {Promise<Target>}
 */
module.exports = async (xid, hostname, name) => {
  const query = `-- ${MODULE_NAME} A87B8247
    SET STATEMENT max_statement_time=100 FOR
    SELECT * FROM ??
    WHERE
      name = ?
      AND hostname = ?
    LIMIT 1
  `.trim();

  const values = [
    TABLE_NAME,
    name,
    hostname,
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return (result || [])[0];
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} CF2A378F: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
