# read-glob

[![npm version](https://img.shields.io/npm/v/read-glob.svg)](https://www.npmjs.com/package/read-glob)
[![Build Status](https://travis-ci.org/shinnn/node-read-glob.svg?branch=master)](https://travis-ci.org/shinnn/node-read-glob)
[![Build status](https://ci.appveyor.com/api/projects/status/9cf2k7pkog7ax2fs/branch/master?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/node-read-glob/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/node-read-glob.svg)](https://coveralls.io/github/shinnn/node-read-glob)

Search files with glob pattern and read them, [Observable](https://github.com/tc39/proposal-observable) way

```javascript
const readGlob = require('read-glob');

readGlob('src/*.js').subscribe({
  start() {
    console.log('Glob started.');
  },
  next(result) {
    result.cwd; //=> '/Users/shinnn/exmaple'
    result.path; //=> 'src/a.js'
    result.contents; //=> <Buffer ... >
  },
  complete() {
    console.log('Glob completed.');
  }
});
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install read-glob
```

## API

```javascript
const readGlob = require('read-glob');
```

### readGlob(*pattern* [, *options*])

*pattern*: `string` (glob pattern)  
*options*: `Object` ([`node-glob`] and [`fs.readFile`] options) or `string` (encoding)  
Return: [`Observable`](https://github.com/tc39/proposal-observable#observable) ([zenparsing's implementation](https://github.com/zenparsing/zen-observable))

When the `Observable` is [subscribe](https://tc39.github.io/proposal-observable/#observable-prototype-subscribe)d, it starts to search files matching the given glob pattern, read their contents and successively send results to its [`Observer`](https://github.com/tc39/proposal-observable#observer).

#### Results

Each result is the same `Object` as [`glob-observable`'s](https://github.com/shinnn/glob-observable#match-result) with the additional `contents` property, a `Buffer` or `string` of the matched file contents.

`contents` is a `string` when the `encoding` option is specified, otherwise it's a `Buffer`.

```javascript
readGlob('hi.txt').subscribe(result => {
  result.contents; //=> <Buffer 48 69>
});

readGlob('hi.txt', 'utf8').subscribe(result => {
  result.contents; //=> 'Hi'
});

readGlob('hi.txt', 'base64').subscribe(result => {
  result.contents; //=> 'SGk='
});
```

#### options

The option object will be directly passed to [`node-glob`] and [`fs.readFile`], or the encoding string sets the encoding of `fs.readFile`.

Unlike the original node-glob API,

* `silent` and `strict` options are `true` by default.
* `nodir` and `mark` options are not supported as it ignores directories by default.

```javascript
const readGlob = require('read-glob');

// ./directory/.dot.txt: 'Hello'

readGlob('*.txt', {
  cwd: 'directory',
  dot: true
}).subscribe(({contents}) => {
  contents.toString(); //=> 'Hello'
});
```

## Related project

* [read-glob-promise](https://github.com/shinnn/read-glob-promise) ([Promise](https://promisesaplus.com/) version)

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe

[`fs.readFile`]: https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
[`node-glob`]: https://github.com/isaacs/node-glob#options
