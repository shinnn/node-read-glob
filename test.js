'use strict';

var glob = require('glob');
var noop = require('nop');
var readGlob = require('./');
var test = require('tape');
var xtend = require('xtend');

test('readGlob()', function(t) {
  t.plan(16);

  readGlob('{.git{attributes,ignore},node_*/{glob,xtend}}', 'utf8', function(err, contents) {
    t.strictEqual(
      err, null,
      'should ignore directories even if the second argument is a string.'
    );
    t.deepEqual(contents, [
      '* text=auto\n',
      'coverage\nnode_modules\n'
    ], 'should reflect encoding to the result.');
  });

  var options = {
    nounique: true,
    noglobstar: true,
    encoding: 'hex'
  };

  var optionsClone = xtend(options);

  readGlob('{.gitattribute{s,s},**/test.js,node_*,../}', options, function(err, contents) {
    t.strictEqual(err, null, 'should ignore directories by default.');
    t.deepEqual(contents, [
      new Buffer('* text=auto\n').toString('hex'),
      new Buffer('* text=auto\n').toString('hex')
    ], 'should reflect minimatch, node-glob and fs.readFile to the result.');
    t.deepEqual(
      options, optionsClone,
      'should not modify the original option object.'
    );
  });

  readGlob('__foo__bar__baz__qux__', null, function(err, bufs) {
    t.strictEqual(err, null, 'should not fail even if it doesn\'t read any files.');
    t.deepEqual(bufs, [], 'should pass an empty array to the callback when it reads no files.');
  });

  readGlob('node_modules', {nodir: false}, function(err) {
    t.equal(err.code, 'EISDIR', 'should fail when it cannot read the target.');
  });

  var g = readGlob('/**/*', function(err) {
    t.ok(g.aborted, 'should abort glob before it calls callback function.');
    t.ok(
      err.code,
      'should fail when it tries to access unaccessible paths, such as ' + err.path
    );
  });

  t.strictEqual(g.constructor, glob.Glob, 'should return glob instance.');

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
