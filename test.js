'use strict';

const glob = require('glob');
const readGlob = require('.');
const test = require('tape');
const unglobbable = require('unglobbable');

test('readGlob()', t => {
	t.plan(13);

	readGlob('{.git{attributes,ignore},node_*/{glob,lodash}}', 'utf8', (err, contents) => {
		t.deepEqual(
			[err, contents],
			[null, ['* text=auto\n', '.nyc_output\ncoverage\nnode_modules\n']],
			'should reflect encoding to the result.'
		);
	});

	const options = {
		nounique: true,
		ignore: '.gitignore',
		noglobstar: true,
		encoding: 'hex'
	};

	const optionsClone = Object.assign({}, options);

	readGlob('{.*it*e{,s,s},**/test.js,node_*,../}', options, (err, contents) => {
		const expected = Buffer.from('* text=auto\n').toString('hex');

		t.deepEqual(
			[err, contents],
			[null, [expected, expected]],
			'should reflect minimatch, node-glob and fs.readFile options to the result.'
		);
		t.deepEqual(options, optionsClone, 'should not modify the original option object.');
	});

	readGlob('__foo__bar__baz__qux__', null, (err, bufs) => {
		t.deepEqual(
			[err, bufs],
			[null, []],
			'should pass an empty array to the callback when it reads no files.'
		);
	});

	readGlob('node_modules', {nodir: false}, err => {
		t.equal(err.code, 'EISDIR', 'should fail when it cannot read the target.');
	});

	const g = readGlob(unglobbable, err => {
		t.ok(g.aborted, 'should abort glob before it calls callback function.');
		t.ok(
			err.code,
			`should fail when it tries to access unaccessible paths, such as ${err.path}`
		);
	});

	t.equal(g.constructor, glob.Glob, 'should return glob instance.');

	t.throws(
		() => readGlob([''], t.fail),
		/TypeError.*string required/,
		'should throw a type error when the first argument is not a string.'
	);

	t.throws(
		() => readGlob('*', 1, t.fail),
		/TypeError.*argument/,
		'should throw a type error when it takes invalid option value.'
	);

	t.throws(
		() => readGlob('', 'utf7', t.fail),
		/Error.*encoding/,
		'should throw a type error when the encoding is unknown.'
	);

	t.throws(
		() => readGlob([''], true),
		/TypeError.*Last argument/,
		'should throw a type error when the last argument is not a function.'
	);

	t.throws(
		() => readGlob(),
		/TypeError.*Last argument/,
		'should throw a type error when it takes no arguments.'
	);
});
