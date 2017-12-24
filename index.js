'use strict';

var assertFsReadFileOption = require('assert-fs-readfile-option');
var assertValidGlobOpts = require('assert-valid-glob-opts');
var glob = require('glob');
var objectAssign = require('object-assign');
var readMultipleFiles = require('read-multiple-files');

var defaultOption = {
	nodir: true,
	silent: true,
	strict: true
};

module.exports = function readGlob(globPattern, options, cb) {
	if (cb === undefined) {
		cb = options;
		options = defaultOption;
	} else if (options) {
		assertFsReadFileOption(options);

		if (typeof options === 'string') {
			options = {
				encoding: options,
				nodir: true,
				silent: true,
				strict: true
			};
		} else {
			assertValidGlobOpts(options);

			options = objectAssign({
				nodir: true,
				silent: true,
				strict: true
			}, options);
		}
	} else {
		options = defaultOption;
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

	return g;
};
