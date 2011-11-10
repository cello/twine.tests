/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false, process: false*/


// setup our global define and require
require('./external/dojo/dojo');


var req = global.require,
	path = require('path'),
	args = process.argv,
	testDep = args[2] || 'test/all';

// configure dojo via global require
req({
	baseUrl: __dirname,
	packages: [
		{
			name: 'dojo',
			location: 'external/dojo'
		},
		{
			name: 'twine',
			location: 'external/twine',
			main: 'Twine'
		},
		{
			name: 'patr',
			location: 'external/patr',
			main: './runner'
		},
		{
			name: 'promised-io',
			location: 'external/promised-io'
		}
	],
	paths: {
		test: "."
	}
});

// do some juggling to define node's top level modules
'assert,sys'.split(',').forEach(function (id) {
	define(id, require(id));
});

// make sinon work - dojo doesn't load non-AMD CommonJS modules
define('sinon', require('./external/sinon'));

// kick start the tests
req(['patr', testDep], function (patr, test) {
	patr.run(test);
});
