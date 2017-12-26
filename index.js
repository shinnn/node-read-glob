'use strict';

const assertFsReadFileOption = require('assert-fs-readfile-option');
const assertValidGlobOpts = require('assert-valid-glob-opts');
const glob = require('glob');
const readMultipleFiles = require('read-multiple-files');

const defaultOption = {
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

			options = Object.assign({
				nodir: true,
				silent: true,
				strict: true
			}, options);
		}
	} else {
		options = defaultOption;
	}

	if (typeof cb !== 'function') {
		throw new TypeError(`${cb} is not a function. Last argument must be a function.`);
	}

	const g = new glob.Glob(globPattern, options, (err, filePaths) => {
		if (err) {
			g.abort();
			cb(err);
			return;
		}

		readMultipleFiles(filePaths, options, cb);
	});

	return g;
};
