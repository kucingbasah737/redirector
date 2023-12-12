const MODULE_NAME = 'GET-HITS-DAILY';

const TABLE_NAME = 'hits';
const TABLE_NAME_TARGETS = 'targets';

const dayjs = require('dayjs');
const logger = require('./logger');
const mysql = require('./mysql');

const subtractDays = (dayCount, includeToday) => (
  includeToday
    ? dayCount
    : dayCount + 1
);

const datesBackward = (dayCount, includeToday) => {
  const retval = [];
  for (let i = 0; i <= dayCount; i += 1) {
    retval.push(dayjs().subtract(includeToday ? i : i + 1, 'days').format('YYYY-MM-DD'));
  }

  return retval.reverse();
};

/**
 * @typedef ChartValue
 * @type {object}
 * @property {string} label
 * @property {string} labelFull
 * @property {number} value
 */

/**
 *
 * @param {string} xid
 * @param {string} [targetUuid]
 * @param {string} [userEmail]
 * @param {number} [dayCount=7]
 * @param {boolean} [includeToday]
 * @returns {Promise<ChartValue[]>}
 */
module.exports = async (xid, targetUuid, userEmail, dayCount, includeToday) => {
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

  conditions.push('h.created_date > ?');
  values.push(dayjs().subtract(subtractDays(dayCount, includeToday), 'day').format('YYYY-MM-DD'));

  if (!includeToday) {
    conditions.push('h.created_date <> CURDATE()');
  }

  const query = `
    SELECT
      h.created_date,
      COUNT(1) AS hitCount
    FROM ?? h
      ${leftJoins && leftJoins.join('\n')}
    WHERE
      ${conditions.join(' AND ')}
    GROUP BY h.created_date
    ORDER BY h.created_date ASC
  `.trim();

  try {
    /**
     * @type {import('./types/ChartValue').ChartValue[]};
     */
    const retval = [];
    const [rowsFromDb] = await mysql.poolPromise.query(query, values);

    const dates = datesBackward(dayCount, includeToday);

    dates
      .forEach((date) => {
        const row = rowsFromDb.find((item) => item.created_date === date);
        retval.push({
          labelFull: date,
          label: dayjs(date).format('DD') === '01' ? date : dayjs(date).format('DD'),
          value: row?.hitCount || 0,
        });
      });

    return retval;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} CC595621: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
