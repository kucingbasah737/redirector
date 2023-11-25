/* eslint-disable no-console */
module.exports = async () => {
  // eslint-disable-next-line global-require
  const getHostnameList = require('../get-hostname-list');

  try {
    const result = await getHostnameList(
      null,
    );

    result.forEach((item) => {
      console.log([
        '-',
        item.name,
        `(${item.created})`,
        item.disabled ? 'DISABLED' : '',
      ].join(' ').trim());
    });
  } catch (e) {
    console.warn('Exception');
  }
  process.exit(0);
};
