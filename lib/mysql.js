const MODULE_NAME = 'MYSQL';

const connectionLimit = Number(process.env.MYSQL_POOL_CONNECTION_LIMIT) || 10;

const mysql = require('mysql2');
const logger = require('./logger');

const pool = mysql.createPool({
  socketPath: process.env.MYSQL_SOCKET_PATH,
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  connectionLimit,
});

exports.pool = pool;
exports.poolPromise = pool.promise();

/**
 * Format query dengan replace whitespace berlebih dengan spasi
 *
 * @version 20231125.0417
 *
 * @param {string} query
 * @param {any[]?} values
 * @returns {string}
 */
exports.formatSimplified = (query, values) => pool
  .format(
    query
      .replace(/--.*/g, '')
      .replace(/\s+/g, ' ').trim(),
    values,
  );

pool.on('enquee', () => {
  logger.warn(`${MODULE_NAME} 3EF0A11B: No free connection available, waiting for it`, {
    connectionLimit,
  });
});
