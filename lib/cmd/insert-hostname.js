const prompt = require('prompt');

/* eslint-disable no-console */
module.exports = async () => {
  // eslint-disable-next-line global-require
  const insertHostname = require('../insert-hostname');

  prompt.start();
  const promptResult = await prompt.get([
    {
      name: 'hostname',
      message: 'New hostname',
      required: true,
    },
  ]);

  try {
    const result = await insertHostname(
      null,
      promptResult.hostname,
    );
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
