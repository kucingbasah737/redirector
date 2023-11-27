const MODULE_NAME = 'GET-TARGET-BY-UUID';

const TABLE_NAME = 'targets';
const TABLE_NAME_HITS = 'hits';
const TABLE_GEOIPS = 'geoips';

const mysql = require('./mysql');
const logger = require('./logger');

/**
 *
 * @param {string} xid
 * @param {string} uuid
 * @param {string} [email]
 * @returns {Promise<import('./get-target').Target>}
 */

module.exports = async (xid, uuid, email) => {
  const values = [
    TABLE_NAME,
    TABLE_NAME_HITS,
    TABLE_GEOIPS,
  ];

  const conditions = [];

  conditions.push('t.uuid = ?');
  values.push(uuid);

  if (email) {
    conditions.push('t.user_email = ?');
    values.push(email);
  }

  const query = `
    SET STATEMENT max_statement_time=100 FOR
    SELECT
      t.*,
      h.created AS last_hit_ts,
      h.ip AS last_hit_ip,
      h.headers AS last_hit_headers,
      g.country AS last_hit_country,
      g.region AS last_hit_region,
      g.eu AS last_hit_eu,
      g.timezone AS last_hit_timezone,
      g.city AS last_hit_city,
      g.latitude AS last_hit_latitude,
      g.longitude AS last_hit_longitude,
      g.metro AS last_hit_metro,
      g.area AS last_hit_area
    FROM ?? t
    LEFT JOIN ?? h ON h.uuid = t.last_hit_uuid
    LEFT JOIN ?? g ON g.ip = h.ip
    WHERE
      ${conditions.join(' AND ')}
    LIMIT 1
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return (result || [])[0];
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} DF3B60E6: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
