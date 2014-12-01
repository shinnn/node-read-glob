# read-glob

[![Build Status](https://travis-ci.org/shinnn/node-read-glob.svg?branch=master)](https://travis-ci.org/shinnn/node-read-glob)
[![Build status](https://ci.appveyor.com/api/projects/status/9cf2k7pkog7ax2fs?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/node-read-glob)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/node-read-glob.svg)](https://coveralls.io/r/shinnn/node-read-glob)
[![Dependency Status](https://david-dm.org/shinnn/node-read-glob.svg)](https://david-dm.org/shinnn/node-read-glob)
[![devDependency Status](https://david-dm.org/shinnn/node-read-glob/dev-status.svg)](https://david-dm.org/shinnn/node-read-glob#info=devDependencies)

Search files with glob pattern and read them asynchronously

```javascript
var readGlob = require('read-glob');

readGlob('src/*.txt', function(err, bufs) {
  if (err) {
    throw err;
  }

  bufs; //=> [<Buffer ... >, <Buffer ... >, ...]
});
```

## Installation

[![NPM version](https://badge.fury.io/js/read-glob.svg)](https://www.npmjs.org/package/read-glob)

[Use npm](https://www.npmjs.org/doc/cli/npm-install.html).

```sh
npm install read-glob
```

## API

```javascript
var readGlob = require('read-glob');
```

### readGlob(*pattern* [, *options*], *callback*)

*pattern*: `String` (glob pattern)  
*options*: `Object` (for [glob] and [fs.readFile]) or `String` (for [fs.readFile])  
*callback*: `Function`  
Return: `Object` (instance of [`glob.Glob`](https://github.com/isaacs/node-glob#class-globglob) class)

It is similar to [fs.readFile]. The only deference is that it takes a glob pattern as its first argument.

#### options

The option object will be directly passed to [glob]() and [fs.readFile], or the encoding string sets the encoding of [fs.readFile].

Unlike the original API, glob's `nodir` option is `true` by default.

#### callback(*error*, *contents*)

*error*: `Error` if it fails to read the file, otherwise `null`  
*contents*: `Array` of [`Buffer`](http://nodejs.org/api/buffer.html#buffer_class_buffer) or `String` (according to `encoding` option)

The second argument will be an array of file contents whose order depends on the globbing result. 

```javascript
var readGlob = require('read-glob');

// foo.txt: lorem
// bar.txt: ipsum
// baz.txt: dolor

readGlob('{foo,ba*}.txt', 'utf8', function(err, contents) {
  if (err) {
    throw err;
  }

  contents; //=> ['lorem', 'ipsum', 'dolor']
});

readGlob('{foo,bar.baz}.txt', {nobrace: true}, function(err, contents) {
  if (err) {
    throw err;
  }

  contents; //=> []
});
```

## Related project

* [read-glob-promise](https://github.com/shinnn/read-glob-promise) ([Promises/A+](https://promisesaplus.com/) version)

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[fs.readFile]: http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback
[glob]: https://github.com/isaacs/node-glob#options
