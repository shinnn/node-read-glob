'use strict';

const {dirname} = require('path');
const {performance} = require('perf_hooks');

const globObservable = require('glob-observable');
const {readFile} = require('graceful-fs');

let count = 0;
let rest = 0;

globObservable('**/*', {
	absolute: true,
	cwd: dirname(__dirname),
	dot: true,
	ignore: 'tmp',
	nodir: true
}).subscribe({
	start() {
		console.log('Using `nodir` option');
		performance.mark('start');
	},
	next({path}) {
		rest++;

		readFile(path, err => {
			if (err) {
				throw err;
			}

			count++;
			rest--;

			if (rest !== 0) {
				return;
			}

			performance.mark('end');
			performance.measure('bench', 'start', 'end');

			console.log(`Read ${count} files
Took ${performance.getEntriesByName('bench')[0].duration} ms
`);
		});
	}
});
