# read-glob

[![npm version](https://img.shields.io/npm/v/read-glob.svg)](https://www.npmjs.com/package/read-glob)
[![Build Status](https://travis-ci.org/shinnn/node-read-glob.svg?branch=master)](https://travis-ci.org/shinnn/node-read-glob)
[![Build status](https://ci.appveyor.com/api/projects/status/9cf2k7pkog7ax2fs/branch/master?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/node-read-glob/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/node-read-glob.svg)](https://coveralls.io/github/shinnn/node-read-glob)

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

[Use npm](https://docs.npmjs.com/cli/install).

```sh
npm install read-glob
```

## API

```javascript
var readGlob = require('read-glob');
```

### readGlob(*pattern* [, *options*], *callback*)

*pattern*: `string` (glob pattern)  
*options*: `Object` ([glob] and [fs.readFile] options) or `string` (encoding)  
*callback*: `Function`  
Return: `Object` (instance of [`glob.Glob`](https://github.com/isaacs/node-glob#class-globglob) class)

#### options

The option object will be directly passed to [glob] and [fs.readFile], or the encoding string sets the encoding of [fs.readFile].

Unlike the original API, glob's `nodir` option is `true` by default.

#### callback(*error*, *contents*)

*error*: `Error` if it fails to read the file, otherwise `null`  
*contents*: `Array` of [`Buffer`](https://nodejs.org/api/buffer.html#buffer_class_buffer) or `String` (according to `encoding` option)

The second argument will be an array of file contents whose order depends on the globbing result.

Note that it automatically strips [UTF-8 byte order mark](http://en.wikipedia.org/wiki/Byte_order_mark#UTF-8) from results.

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

* [read-glob-promise](https://github.com/shinnn/read-glob-promise) ([Promise](https://promisesaplus.com/) version)

## License

[ISC License](./LICENSE) © 2017 Shinnosuke Watanabe

[fs.readFile]: https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
[glob]: https://github.com/isaacs/node-glob#options
