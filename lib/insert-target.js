const MODULE_NAME = 'INSERT-TARGET';

const TABLE_NAME = 'targets';

const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, email, hostname, name, targetUrl) => {
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

  const query = 'INSERT INTO ?? SET ?';
  const values = [
    TABLE_NAME,
    {
      name: sanitizedName,
      hostname,
      user_email: email,
      target_url: sanitizedTargetUrl,
    },
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return result;
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
