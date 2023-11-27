const MODULE_NAME = 'WEBSERVER.PREPARE-LOCAL-PUBLIC';

const fs = require('fs/promises');
const logger = require('../logger');

const LOCAL_PUBLIC_DIR = 'public.local';

module.exports = async (xid) => {
  try {
    const stats = await fs.stat(LOCAL_PUBLIC_DIR);
    if (!stats.isDirectory()) {
      const e = `${MODULE_NAME} 63E87A81: LOCAL_PUBLIC_DIR is not a directory. Will delete it and recreate it`;

      logger.warn(e.message, { xid, LOCAL_PUBLIC_DIR });

      await fs.rm(LOCAL_PUBLIC_DIR);

      throw e;
    }
  } catch (e) {
    logger.verbose(`${MODULE_NAME} 25D0C41D: Creating LOCAL_PUBLIC_DIR`, { xid, LOCAL_PUBLIC_DIR });

    await fs.mkdir(LOCAL_PUBLIC_DIR, { recursive: true });
  }
};
