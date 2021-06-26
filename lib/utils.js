'use strict';
const fse = require('fs-extra');
const path = require('path');

exports.findSymlinks = async dir => {
  const files = await fse.readdir(dir);

  const promises = files.map(async file => {
    const filePath = path.join(dir, file);

    const stats = await fse.lstat(filePath);

    if (stats.isSymbolicLink()) {
      return filePath;
    }
  });

  const symlinks = await Promise.all(promises);

  return symlinks.filter(Boolean);
};

exports.toMessage = updates => {
  if (updates === 0) {
    return 'No extensions updated';
  }

  if (updates === 1) {
    return '1 extension updated';
  }

  return `${updates} extensions updated`;
};