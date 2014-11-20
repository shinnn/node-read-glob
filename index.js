/*!
 * read-glob | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/node-read-glob
*/
'use strict';

var glob = require('glob');
var readMultipleFiles = require('read-multiple-files');

module.exports = function readGlob(globPattern, options, cb) {
  if (cb === undefined) {
    cb = options;
    options = {};
  } else {
    options = options || {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError(cb + ' is not a function. Last argument must be a function.');
  }

  if (typeof options === 'object' && options.ignoreDir === undefined) {
    options.ignoreDir = true;
  }

  if (options.ignoreDir) {
    options.mark = true;
  }

  var g = new glob.Glob(globPattern, options, function(err, filePaths) {
    if (err) {
      g.abort();
      cb(err);
      return;
    }

    readMultipleFiles(filePaths.filter(function(filePath) {
      return filePath.charAt(filePath.length - 1) !== '/';
    }), options, cb);
  });
};
