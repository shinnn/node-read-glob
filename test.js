'use strict';

const {join} = require('path');
const {promisify} = require('util');

const isError = require('lodash/fp/isError');
const after = require('lodash/fp/after');
const readGlob = require('.');
const rmfr = require('rmfr');
const {symlink} = require('graceful-fs');
const test = require('tape');
const unglobbable = require('unglobbable');

test('readGlob()', async t => {
	t.plan(20);

	await rmfr(join(__dirname, '.tmp'));
	await promisify(symlink)('this_file_does_not_exist', join(__dirname, '.tmp'));

	readGlob('.git{attributes,ignore}').subscribe({
		next({cwd, path, contents}) {
			if (path === '.gitattributes') {
				t.equal(
					cwd,
					__dirname,
					'should include CWD to the results.'
				);
			} else if (path === '.gitignore') {
				t.ok(
					contents.equals(Buffer.from('.nyc_output\n.tmp\ncoverage\nnode_modules\n')),
					'should include file contents to the results.'
				);
			}
		},
		error: t.fail,
		complete() {
			t.pass('should complete when it reads all files.');
		}
	});

	readGlob('../{.gita*,**/test.js,node_modules}', {
		cwd: join(__dirname, 'node_modules'),
		encoding: 'hex',
		noglobstar: true,
		stat: true
	}).subscribe({
		next({cwd, path, stat, contents}) {
			t.equal(
				path,
				'../.gitattributes',
				'should support node-glob options.'
			);

			t.equal(
				cwd,
				join(__dirname, 'node_modules'),
				'should reflect node-glob options to the results.'
			);

			t.ok(
				stat.isFile(),
				'should add file stats to the results when `stat` option is enabled.'
			);

			t.equal(
				contents,
				Buffer.from('* text=auto\n').toString('hex'),
				'should support fs.readFile options.'
			);
		},
		error: t.fail
	});

	readGlob('.gitattributes', 'base64').subscribe({
		next({contents}) {
			t.equal(
				contents,
				Buffer.from('* text=auto\n').toString('base64'),
				'should accept encoding string as its second argument.'
			);
		},
		error: t.fail
	});

	const values = [];

	readGlob(__dirname, null).forEach(val => values.push(val)).then(() => {
		t.equal(
			values.length,
			0,
			'should send no values when it cannot find any files.'
		);
	});

	const complete = t.fail.bind(t, 'Unexpectedly completed.');

	readGlob('.tmp').subscribe({
		error({code}) {
			t.equal(code, 'ENOENT', 'should resolve symlinks.');
		},
		complete
	});

	const subscription = readGlob('**/*', {
		realpath: true
	}).subscribe({
		next: after(() => {
			subscription.unsubscribe();
			t.equal(subscription.closed, true, 'should be cancelable.');
		})(2),
		error: t.fail,
		complete
	});

	readGlob(unglobbable).subscribe({
		error(err) {
			t.ok(
				isError(err),
				'should fail when it tries to access inaccessible paths.'
			);
		},
		complete
	});

	readGlob([-1]).subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'TypeError: Expected a glob pattern (<string>), but got a non-string value [ -1 ] (array).',
				'should fail when the first argument is not a string.'
			);
		},
		complete
	});

	readGlob('*', 1).subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'TypeError: Expected node-glob options to be an object, but got 1 (number).',
				'should fail when it takes invalid option value.'
			);
		},
		complete
	});

	readGlob('_', 'utf7').subscribe({
		error({code}) {
			t.equal(
				code,
				'ERR_INVALID_OPT_VALUE_ENCODING',
				'should fail when the encoding is unknown.'
			);
		},
		complete
	});

	readGlob('_', {ignore: Math.ceil}).subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'TypeError: node-glob expected `ignore` option to be an array or string, but got [Function: ceil].',
				'should fail when it takes invalid node-glob options.'
			);
		},
		complete
	});

	readGlob('_', {nodir: true}).subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'TypeError: read-glob doesn\'t support `nodir` option as it ignores directory entries by default, but a value true (boolean) was provided for it.',
				'should fail when `nodir` option is enabled.'
			);
		},
		complete
	});

	readGlob('_', {mark: true}).subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'TypeError: read-glob doesn\'t support `mark` option as it only emits file data and there is no need to differentiate file paths and directory paths explicitly, but a value true (boolean) was provided for it.',
				'should fail when `mark` option is enabled.'
			);
		},
		complete
	});

	readGlob().subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'RangeError: Expected 1 or 2 arguments (<string>[, <Object|string>]), but got no arguments.',
				'should throw an error when it takes no arguments.'
			);
		},
		complete
	});

	readGlob('_', '_', '_').subscribe({
		error(err) {
			t.equal(
				err.toString(),
				'RangeError: Expected 1 or 2 arguments (<string>[, <Object|string>]), but got 3 arguments.',
				'should throw an error when it takes too many arguments.'
			);
		},
		complete
	});
});
