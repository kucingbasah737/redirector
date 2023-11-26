/* eslint-disable no-console */
const prompt = require('prompt');

module.exports = async () => {
  // eslint-disable-next-line global-require
  const addUser = require('../add-user');

  prompt.start();
  const promptResult = await prompt.get([
    {
      name: 'email',
      message: 'User email',
      required: true,
    },
    {
      name: 'isSuper',
      message: 'Is super user (true/[false])',
      required: false,
      type: 'boolean',
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
    await addUser(null, promptResult.email, promptResult.newPassword, promptResult.isSuper);
    console.log(`Password for ${promptResult.email} updated`);
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
