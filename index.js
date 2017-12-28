'use strict';

const assertFsReadFileOption = require('assert-fs-readfile-option');
const assertValidGlobOpts = require('assert-valid-glob-opts');
const {Glob} = require('glob');
const readMultipleFiles = require('read-multiple-files');

const ARG_LENGTH_ERROR = 'Expected 2 or 3 arguments (<string>[, <Object>], <Function>)';
const defaultOption = {
	nodir: true,
	silent: true,
	strict: true
};

module.exports = function readGlob(...args) {
	const argLen = args.length;

	if (argLen === 0) {
		const error = new RangeError(`${ARG_LENGTH_ERROR}, but got no arguments.`);
		error.code = 'ERR_MISSING_ARGS';

		throw error;
	}

	if (argLen !== 2 && argLen !== 3) {
		throw new RangeError(`${ARG_LENGTH_ERROR}, but got ${argLen} arguments.`);
	}

	const [globPattern] = args;
	let options = args[1];
	let cb = args[2];

	if (argLen === 2) {
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

	const g = new Glob(globPattern, options, (err, filePaths) => {
		if (err) {
			g.abort();
			cb(err);
			return;
		}

		readMultipleFiles(filePaths, options, cb);
	});

	return g;
};
