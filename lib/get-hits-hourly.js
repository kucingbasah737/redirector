const MODULE_NAME = 'GET-HITS-HOURLY';

const TABLE_NAME = 'hits';
const TABLE_NAME_TARGETS = 'targets';

const dayjs = require('dayjs');
const logger = require('./logger');
const mysql = require('./mysql');

const subtractHours = (hourCount, includeThisHour) => (
  includeThisHour
    ? hourCount
    : hourCount + 1
);

const hoursBackward = (hourCount, includeThiHour) => {
  const retval = [];
  for (let i = 0; i <= hourCount; i += 1) {
    retval.push(dayjs().subtract(includeThiHour ? i : i + 1, 'hours').format('YYYY-MM-DD HH'));
  }

  return retval.reverse();
};

/**
 *
 * @param {string} xid
 * @param {string} [targetUuid]
 * @param {string} [userEmail]
 * @param {number} [hourCount=24]
 * @param {boolean} [includeThisHour]
 * @returns {Promise<import('./types').ChartValue[]>}
 */
module.exports = async (xid, targetUuid, userEmail, hourCount, includeThisHour) => {
  const values = [TABLE_NAME];
  const conditions = [1];
  const leftJoins = [];

  if (userEmail) {
    leftJoins.push('LEFT JOIN ?? t ON t.uuid = h.target_uuid');
    values.push(TABLE_NAME_TARGETS);
    conditions.push('t.user_email = ?');
    values.push(userEmail);
  }

  if (targetUuid) {
    conditions.push('h.target_uuid = ?');
    values.push(targetUuid);
  }

  conditions.push('h.created_date_hour > ?');
  values.push(dayjs().subtract(subtractHours(hourCount, includeThisHour), 'hours').format('YYYY-MM-DD HH'));

  if (!includeThisHour) {
    conditions.push('h.created_date_hour <> ?');
    values.push(dayjs().format('YYYY-MM-DD HH'));
  }

  const query = `
    SELECT
      h.created_date_hour,
      COUNT(1) AS hitCount
    FROM ?? h
      ${leftJoins && leftJoins.join('\n')}
    WHERE
      ${conditions.join(' AND ')}
    GROUP BY h.created_date_hour
    ORDER BY h.created_date_hour ASC
  `.trim();

  try {
    /**
     * @type {import('./types/ChartValue').ChartValue[]};
     */
    const retval = [];
    const [rowsFromDb] = await mysql.poolPromise.query(query, values);

    const hours = hoursBackward(hourCount, includeThisHour);

    hours
      .forEach((hour) => {
        const row = rowsFromDb.find((item) => item.created_date_hour === hour);
        retval.push({
          labelFull: `${hour}:00:00`,
          label: dayjs(`${hour}:00:00`).format('HH'),
          value: row?.hitCount || 0,
        });
      });

    return retval;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 748ED431: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};