const MODULE_NAME = 'WEBSERVER.GEOIP-LITE-INIT';

const fs = require('node:fs');
const path = require('node:path');
const logger = require('../logger');

if (!process.env.GEOTMPDIR) {
  process.env.GEOTMPDIR = path.join(
    process.cwd(),
    'data/geoip-lite/tmp',
  );
}

if (!process.env.GEODATADIR) {
  process.env.GEODATADIR = path.join(
    process.cwd(),
    'data/geoip-lite/data',
  );
}

if (
  !fs.existsSync(path.join(
    process.env.GEODATADIR,
    'geoip-city.dat',
  ))
) {
  logger.verbose(`${MODULE_NAME} 4B5700B5: Missing geoip-lite database, will use default package data`, {
    customDataDir: process.env.GEODATADIR,
  });

  process.env.GEOTMPDIR = '';
  process.env.GEODATADIR = '';
}

if (process.env.GEODATADIR) {
  logger.debug(`${MODULE_NAME} FED27BCC: geoip-lite database will use this custom data directory`, {
    dataDir: process.env.GEODATADIR,
    tmpDir: process.env.GEOTMPDIR,
  });
}

// eslint-disable-next-line import/order
const geoip = require('geoip-lite');

geoip.startWatchingDataUpdate((e) => {
  if (e) {
    logger.warn(`${MODULE_NAME} F12A6EE7: Exception on geoip-lite database update watch`, {
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    return;
  }

  logger.info(`${MODULE_NAME} 58E7F04D: Database change detected`);
});
