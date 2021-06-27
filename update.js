const arvish = require('arvish');
const latestVersion = require('latest-version');
const semver = require('semver');
const path = require('path');
const execa = require('execa');
const readPkg = require('read-pkg');
const fse = require('fs-extra');
const { findValidSymlinks, toMessage } = require('./lib/utils');

const output = [];

const update = async pkg => {
  try {
    return await execa('npm', ['install', '-g', pkg.name]);
  } catch (error) {
    output.push(error.message);
  }
};

const checkAndUpdate = async filePath => {
  try {
    const pkg = await readPkg({ cwd: filePath });

    if (!pkg.name || !pkg.version) {
      return;
    }

    const version = await latestVersion(pkg.name);

    if (semver.gt(version, pkg.version)) {
      return update(pkg);
    }
  } catch (_) {
    // Do nothing
  }
};

(async () => {
  try {
    const tempArr = (arvish.env.data).split(path.sep);
    const extensionDataDir = tempArr.slice(tempArr, tempArr.length - 2).join(path.sep);

    // Retrieve all the symlinks from the workflows directory
    const filePaths = [
      ...await findValidSymlinks(path.resolve(extensionDataDir, 'workflows')),
      ...await findValidSymlinks(path.resolve(extensionDataDir, 'plugins'))
    ];

    // Iterate over all the workflows, check if they are outdated and update them
    const promises = filePaths.map(filePath => checkAndUpdate(filePath));

    const result = await Promise.all(promises);

    if (output.length > 0) {
      throw new Error(output.join('\n'));
    }

    console.log(toMessage(result.filter(Boolean).length));
  } catch (error) {
    fse.writeFileSync('output', error.message);
    console.log('Something went wrong');
  } finally {
    fse.writeFile(path.resolve(arvish.env.data, 'arvis-extension-renew'), '');
  }
})();