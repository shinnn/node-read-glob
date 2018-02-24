'use strict';

const {resolve} = require('path');

const assertFsReadFileOption = require('assert-fs-readfile-option');
const globObservable = require('glob-observable');
const inspectWithKind = require('inspect-with-kind');
const Observable = require('zen-observable');
const {readFile} = require('graceful-fs');

const ARG_LENGTH_ERROR = 'Expected 1 or 2 arguments (<string>[, <Object|string>])';
const READFILE_OPTIONS = new Set(['encoding', 'flag']);

module.exports = function readGlob(...args) {
	return new Observable(observer => {
		const argLen = args.length;

		if (argLen === 0) {
			const error = new RangeError(`${ARG_LENGTH_ERROR}, but got no arguments.`);
			error.code = 'ERR_MISSING_ARGS';

			throw error;
		}

		if (argLen !== 1 && argLen !== 2) {
			throw new RangeError(`${ARG_LENGTH_ERROR}, but got ${argLen} arguments.`);
		}

		const [globPattern] = args;
		const readFileOptions = {};
		let options = args[1];

		if (argLen !== 1) {
			if (typeof options === 'string') {
				readFileOptions.encoding = options;
				options = {};
			} else if (options !== null && typeof options === 'object') {
				if (options.nodir) {
					throw new TypeError(`read-glob doesn't support \`nodir\` option as it ignores directory entries by default, but a value ${
						inspectWithKind(options.nodir)
					} was provided for it.`);
				}

				if (options.mark) {
					throw new TypeError(`read-glob doesn't support \`mark\` option as it only emits file data and there is no need to differentiate file paths and directory paths explicitly, but a value ${
						inspectWithKind(options.mark)
					} was provided for it.`);
				}

				for (const readFileOption of READFILE_OPTIONS) {
					if (options[readFileOption] !== undefined) {
						readFileOptions.encoding = options.encoding;
					}
				}
			}
		}

		assertFsReadFileOption(readFileOptions);

		let rest = 0;

		function completeIfNeeded() {
			rest--;

			if (!subscription.closed) { // eslint-disable-line no-use-before-define
				return;
			}

			if (rest !== 0) {
				return;
			}

			observer.complete();
		}

		const subscription = globObservable(globPattern, options).subscribe({
			next(value) {
				rest++;

				if (value.stat && value.stat.isDirectory()) {
					completeIfNeeded();
					return;
				}

				readFile(resolve(value.cwd, value.path), readFileOptions, (err, contents) => {
					if (err) {
						if (err.code !== 'EISDIR') {
							observer.error(err);
							return;
						}
					} else {
						value.contents = contents;
						observer.next(value);
					}

					completeIfNeeded();
				});
			},
			error(err) {
				observer.error(err);
			},
			complete() {
				if (rest !== 0) {
					return;
				}

				observer.complete();
			}
		});

		return function abortReadGlob() {
			subscription.unsubscribe();
		};
	});
};
