const MODULE_NAME = 'INSERT-HOSTNAME';

const TABLE_NAME = 'hostnames';

const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, name) => {
  const query = 'INSERT INTO ?? SET ?';
  const values = [
    TABLE_NAME,
    {
      name: name.trim(),
    },
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);

    logger.verbose(`${MODULE_NAME} 9990FA77: Hostname inserted`, {
      xid,
      result,
    });
    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 25301BF0: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message,
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
