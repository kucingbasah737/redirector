/* eslint-disable no-console */
// const MODULE_NAME = 'MAIN';

process.chdir(__dirname);

require('dotenv').config();
const prompt = require('prompt');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// const logger = require('./lib/logger');
const sdNotify = require('./lib/sd-notify');

const updatePasswordCmd = async () => {
  // eslint-disable-next-line global-require
  const updatePassword = require('./lib/update-password');

  prompt.start();
  const promptResult = await prompt.get([
    {
      name: 'email',
      message: 'User email',
      required: true,
    },
    {
      name: 'newPassword',
      message: 'New password',
      required: true,
      hidden: true,
    },
    {
      name: 'newPassword1',
      message: 'Retype new password',
      required: true,
      hidden: true,
    },
  ]);

  if (promptResult.newPassword !== promptResult.newPassword1) {
    console.warn('Password does not match');
    process.exit(0);
  }

  // console.log(`Going to update "${promptResult.email}" password`);
  try {
    // eslint-disable-next-line no-unused-vars
    const result = await updatePassword(null, promptResult.email, promptResult.newPassword);
    console.log(`Password for ${promptResult.email} updated`);
    // console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};

const runWebServer = async () => {
  // eslint-disable-next-line global-require
  const webserver = require('./lib/webserver');

  webserver();

  // logger.info(`${MODULE_NAME} 300582D4: Starting webserver`);
  if (process.env.SYSTEMD_NOTIFY) {
    sdNotify();
  }
};

// eslint-disable-next-line no-unused-vars
const { argv } = yargs(hideBin(process.argv))
  .command('update-password', 'update user password', () => {}, updatePasswordCmd)
  .command('serve', 'serve the world', () => {}, runWebServer)
  .demandCommand()
  .strict();
