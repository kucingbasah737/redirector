/* eslint-disable no-console */

const prompt = require('prompt');

module.exports = async () => {
  // eslint-disable-next-line global-require
  const getTargetList = require('../get-target-list');

  prompt.start();
  const promptResult = await prompt.get([
    {
      name: 'email',
      message: 'User email',
      required: false,
    },
    {
      name: 'hostname',
      message: 'Hostname',
      required: false,
    },
    {
      name: 'includeDisabled',
      message: 'Include disabled targets (true/[false])',
      required: false,
      type: 'boolean',
    },
  ]);

  try {
    const result = await getTargetList(
      null,
      promptResult.hostname,
      promptResult.email,
      promptResult.includeDisabled,
    );

    result.forEach((item) => {
      console.log([
        '-',
        item.full_url,
        item.target_url,
        item.user_email,
        item.created,
        item.disabled ? 'DISABLED' : '',
      ].join(' ').trim());
    });
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
