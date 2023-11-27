const simpleGit = require('simple-git');

module.exports = async () => {
  if (!global.appVersion) {
    global.appVersion = (await simpleGit().raw('describe')).trim();
  }

  return global.appVersion;
};
