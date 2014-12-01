/*!
 * read-glob | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/node-read-glob
*/
'use strict';

var assertFsReadFileOption = require('assert-fs-readfile-option');
var glob = require('glob');
var readMultipleFiles = require('read-multiple-files');
var xtend = require('xtend');

var defaultOption = {nodir: true};

module.exports = function readGlob(globPattern, options, cb) {
  if (cb === undefined) {
    cb = options;
    options = defaultOption;
  } else {
    if (options) {
      assertFsReadFileOption(options);
      if (typeof options === 'string') {
        options = {
          encoding: options,
          nodir: true
        };
      } else {
        options = xtend(defaultOption, options);
      }
    } else {
      options = defaultOption;
    }
  }

  if (typeof cb !== 'function') {
    throw new TypeError(cb + ' is not a function. Last argument must be a function.');
  }

  var g = new glob.Glob(globPattern, options, function(err, filePaths) {
    if (err) {
      g.abort();
      cb(err);
      return;
    }

    readMultipleFiles(filePaths, options, cb);
  });
};
