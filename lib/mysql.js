const mysql = require('mysql2');

const pool = mysql.createPool({
  socketPath: process.env.MYSQL_SOCKET_PATH,
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

exports.pool = pool;
exports.poolPromise = pool.promise();

/**
 * Format query dengan replace whitespace berlebih dengan spasi
 *
 * @param {string} query
 * @param {any[]?} values
 * @returns {string}
 */
exports.formatSimplified = (query, values) => pool
  .format(
    query.replace(/\s+/g, ' ').trim(),
    values,
  );
