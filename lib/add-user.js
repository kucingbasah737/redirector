const MODULE_NAME = 'ADD-USER';

const TABLE_NAME = 'users';
const SALT_ROUND = 10;

const bcrypt = require('bcrypt');
const logger = require('./logger');
const mysql = require('./mysql');

module.exports = async (xid, email, password, isSuper) => {
  const query = 'INSERT INTO ?? SET ?';
  const values = [
    TABLE_NAME,
    {
      email,
      password: await bcrypt.hash(password, SALT_ROUND),
      super: isSuper ? 1 : 0,
    },
  ];

  try {
    const [result] = await mysql.poolPromise.query(query, values);
    return result;
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 8E028548: Exception`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
      query: mysql.formatSimplified(query, values),
    });

    throw newE;
  }
};
