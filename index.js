#!/usr/bin/env node

/* eslint-disable no-console */
// const MODULE_NAME = 'MAIN';

process.title = 'REDIRECTOR';
process.chdir(__dirname);

const fs = require('node:fs/promises');

require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// const logger = require('./lib/logger');

const sdNotify = require('./lib/sd-notify');
const updatePassword = require('./lib/cmd/update-password');
const insertTarget = require('./lib/cmd/insert-target');
const insertHostname = require('./lib/cmd/insert-hostname');
const hostnameList = require('./lib/cmd/hostname-list');
const targetList = require('./lib/cmd/target-list');
const addUser = require('./lib/cmd/add-user');
const getAppVersion = require('./lib/get-app-version');

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

const showVersion = async () => {
  await getAppVersion();
  console.log(global.appVersion);
};

// eslint-disable-next-line no-unused-vars
const { argv } = yargs(hideBin(process.argv))
  .command('add-user', 'add a new user', () => {}, addUser)
  .command('update-password', 'update user password', () => {}, updatePassword)
  .command('insert-target', 'insert a new target', () => {}, insertTarget)
  .command('insert-hostname', 'insert a new hostname', () => {}, insertHostname)
  .command('hostname-list', 'hostname list', () => {}, hostnameList)
  .command('target-list', 'hostname list', () => {}, targetList)
  .command('serve', 'serve the world', () => {}, runWebServer)
  .command('version', 'show app version', () => {}, showVersion)
  .demandCommand()
  .strict();
