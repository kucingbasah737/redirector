#!/usr/bin/env node

/* eslint-disable no-console */
// const MODULE_NAME = 'MAIN';

process.title = 'REDIRECTOR';
process.chdir(__dirname);

const fs = require('node:fs/promises');

require('dotenv').config();
const prompt = require('prompt');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// const logger = require('./lib/logger');
const sdNotify = require('./lib/sd-notify');

const insertTarget = require('./lib/cmd/insert-target');
const insertHostname = require('./lib/cmd/insert-hostname');
const hostnameList = require('./lib/cmd/hostname-list');
const targetList = require('./lib/cmd/target-list');

const runWebServer = async () => {
  // eslint-disable-next-line global-require
  const webserver = require('./lib/webserver');

  webserver();

  // logger.info(`${MODULE_NAME} 300582D4: Starting webserver`);
  if (process.env.SYSTEMD_NOTIFY) {
    sdNotify();
  }

  // write pid file
  await fs.writeFile('pid.txt', process.pid.toString());
};

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

  try {
    await updatePassword(null, promptResult.email, promptResult.newPassword);
    console.log(`Password for ${promptResult.email} updated`);
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};

// eslint-disable-next-line no-unused-vars
const { argv } = yargs(hideBin(process.argv))
  .command('update-password', 'update user password', () => {}, updatePasswordCmd)
  .command('insert-target', 'insert a new target', () => {}, insertTarget)
  .command('insert-hostname', 'insert a new hostname', () => {}, insertHostname)
  .command('hostname-list', 'hostname list', () => {}, hostnameList)
  .command('target-list', 'hostname list', () => {}, targetList)
  .command('serve', 'serve the world', () => {}, runWebServer)
  .demandCommand()
  .strict();
