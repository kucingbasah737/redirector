/**
 *
 * @param {string} name
 * @returns {string}
 */
module.exports = (name) => (name || '')
  .trim()
  .replace(/\W/g, '');
