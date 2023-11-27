const urlJoin = require('url-join');

const PROTOCOL = process.env.HOSTNAME_PROTOCOL || 'https';
const PORT = process.env.HOSTNAME_PORT || '';

module.exports = (hostname, path) => urlJoin(
  [
    PROTOCOL,
    '://',
    hostname,
    PORT || '',
  ].join(''),
  path,
);
