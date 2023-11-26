const MODULE_NAME = 'INSERT-TARGET';

const TABLE_NAME = 'targets';

const { v1: uuidv1 } = require('uuid');
const logger = require('./logger');
const mysql = require('./mysql');

/**
 *
 * @param {string} xid
 * @param {string} email
 * @param {string} hostname
 * @param {string} name
 * @param {string} targetUrl
 * @param {boolean} disabled
 * @param {string} [uuid]
 * @returns
 */
module.exports = async (xid, email, hostname, name, targetUrl, disabled, uuid) => {
  const sanitizedName = (name || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/$/g, '')
    .trim();

  if (!sanitizedName) {
    return null;
  }

  let sanitizedTargetUrl = targetUrl.trim();
  if (sanitizedTargetUrl.search(/^http(s)*:\/\//) < 0) {
    sanitizedTargetUrl = `https://${sanitizedTargetUrl}`;
  }

  if (!sanitizedTargetUrl) {
    return null;
  }

  const newUuid = uuid || uuidv1();
  const query = 'INSERT INTO ?? SET ?';
  const values = [
    TABLE_NAME,
    {
      uuid: newUuid,
      name: sanitizedName,
      hostname,
      user_email: email,
      target_url: sanitizedTargetUrl,
      disabled: disabled ? 1 : 0,
    },
  ];

  try {
    await mysql.poolPromise.query(query, values);
    return newUuid;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 2340DA44: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
