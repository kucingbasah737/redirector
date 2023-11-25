const prompt = require('prompt');

/* eslint-disable no-console */
module.exports = async () => {
  // eslint-disable-next-line global-require
  const insertTarget = require('../insert-target');

  prompt.start();
  const promptResult = await prompt.get([
    {
      name: 'email',
      message: 'User email',
      required: true,
    },
    {
      name: 'hostname',
      message: 'Hostname',
      required: true,
    },
    {
      name: 'path',
      message: 'Path',
      required: true,
    },
    {
      name: 'targetUrl',
      message: 'Redirect to',
      required: true,
    },
  ]);

  try {
    const result = await insertTarget(
      null,
      promptResult.email,
      promptResult.hostname,
      promptResult.path,
      promptResult.targetUrl,
    );
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
