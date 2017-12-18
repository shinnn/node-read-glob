'use strict';

var glob = require('glob');
var readGlob = require('./');
var test = require('tape');
var xtend = require('xtend');

test('readGlob()', function(t) {
  t.plan(14);

  readGlob('{.git{attributes,ignore},node_*/{glob,xtend}}', 'utf8', function(err, contents) {
    t.deepEqual(
      [err, contents],
      [null, ['* text=auto\n', 'coverage\nnode_modules\n']],
      'should reflect encoding to the result.'
    );
  });

  readGlob('{.git{attributes,ignore},node_*/{glob,xtend}}', {encoding: 'utf8', asObject: true}, function(err, contents) {
    t.deepEqual(
      [err, contents],
      [null, {'.gitattributes': '* text=auto\n', '.gitignore': 'coverage\nnode_modules\n'}],
      'should reflect encoding to the asObject result.'
    );
  });

  var options = {
    nounique: true,
    ignore: '.gitignore',
    noglobstar: true,
    encoding: 'hex'
  };

  var optionsClone = xtend(options);

  readGlob('{.*it*e{,s,s},**/test.js,node_*,../}', options, function(err, contents) {
    var expected = new Buffer('* text=auto\n').toString('hex');

    t.deepEqual(
      [err, contents],
      [null, [expected, expected]],
      'should reflect minimatch, node-glob and fs.readFile options to the result.'
    );
    t.deepEqual(options, optionsClone, 'should not modify the original option object.');
  });

  readGlob('__foo__bar__baz__qux__', null, function(err, bufs) {
    t.deepEqual(
      [err, bufs],
      [null, []],
      'should pass an empty array to the callback when it reads no files.'
    );
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
    readGlob.bind(null, [''], t.fail),
    /TypeError.*string required/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    readGlob.bind(null, '*', 1, t.fail),
    /TypeError.*argument/,
    'should throw a type error when it takes invalid option value.'
  );

  t.throws(
    readGlob.bind(null, '', 'utf7', t.fail),
    /Error.*encoding/,
    'should throw a type error when the encoding is unknown.'
  );

  t.throws(
    readGlob.bind(null, [''], true),
    /TypeError.*Last argument/,
    'should throw a type error when the last argument is not a function.'
  );

  t.throws(
    readGlob.bind(null),
    /TypeError.*Last argument/,
    'should throw a type error when it takes no arguments.'
  );
});
