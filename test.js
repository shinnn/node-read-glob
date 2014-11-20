'use strict';

var noop = require('nop');
var readGlob = require('./');
var test = require('tape');

test('readGlob()', function(t) {
  t.plan(13);

  readGlob('.git{attributes,ignore}', 'utf8', function(err, contents) {
    t.strictEqual(err, null, 'should read files.');
    t.deepEqual(contents, [
      '* text=auto\n',
      'coverage\nnode_modules\n'
    ], 'should reflect encoding to the result.');
  });

  readGlob('{.gitattribute{s,s},**/index.js,node_modules,../}', {
    nounique: true,
    noglobstar: true,
    encoding: 'hex'
  }, function(err, contents) {
    t.strictEqual(err, null, 'should ignore directories.');
    t.deepEqual(contents, [
      new Buffer('* text=auto\n').toString('hex'),
      new Buffer('* text=auto\n').toString('hex')
    ], 'should reflect minimatch, node-glob and fs.readFile to the result.');
  });

  readGlob('__foo__bar__baz__qux__', {ignoreDir: true}, function(err, bufs) {
    t.strictEqual(err, null, 'should not fail even if it doesn\'t read any files.');
    t.deepEqual(bufs, [], 'should pass an empty array to the callback when it reads no files.');
  });

  readGlob('node_modules', {ignoreDir: false}, function(err) {
    t.equal(err.code, 'EISDIR', 'should fail when it cannot read the target.');
  });

  readGlob('/**/*', function(err) {
    t.ok(err.code, 'should fail when globbing fails.');
  });

  t.throws(
    readGlob.bind(null, [''], noop), /TypeError.*string required/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    readGlob.bind(null, '*', 1, noop), /TypeError.*argument/,
    'should throw a type error when it takes invalid option value.'
  );

  t.throws(
    readGlob.bind(null, '', 'utf7', noop), /Error.*encoding/,
    'should throw a type error when the encoding is unknown.'
  );

  t.throws(
    readGlob.bind(null, [''], true), /TypeError.*Last argument/,
    'should throw a type error when the last argument is not a function.'
  );

  t.throws(
    readGlob.bind(null), /TypeError.*Last argument/,
    'should throw a type error when it takes no arguments.'
  );
});
