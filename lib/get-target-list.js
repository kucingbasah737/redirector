const MODULE_NAME = 'GET-TARGET-LIST';

const TABLE_NAME = 'targets';
const TABLE_NAME_HITS = 'hits';
const TABLE_NAME_GEOIPS = 'geoips';

const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} [hostname]
 * @param {string} [email]
 * @param {boolean} includeDisabled
 * @returns {Promise<import('./get-target').Target[]>}
 */
module.exports = async (xid, hostname, email, includeDisabled) => {
  const values = [TABLE_NAME, TABLE_NAME_HITS, TABLE_NAME_GEOIPS];
  const conditions = [1];

  if (hostname) {
    conditions.push('t.hostname = ?');
    values.push(hostname);
  }

  if (email) {
    conditions.push('t.user_email = ?');
    values.push(email);
  }

  if (!includeDisabled) {
    conditions.push('t.disabled = 0');
  }

  const query = `
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
  `.trim();

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 50F4A490: Exception`);

    logger.error(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
