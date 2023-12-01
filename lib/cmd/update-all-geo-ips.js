const uniqid = require('uniqid');

/* eslint-disable no-console */
module.exports = async () => {
  // eslint-disable-next-line global-require
  require('../webserver/geoip-lite-init');

  // eslint-disable-next-line global-require
  const updateGeoIps = require('../update-geo-ips');

  try {
    await updateGeoIps(uniqid());
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
