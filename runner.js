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

require('./node-amd');
var path = require('path'),
	tests = process.argv[2] ? path.join(process.cwd(), process.argv[2]) : './all';

define([tests, 'patr/runner'], function (tests, patr) {
	'use strict';
	patr.run(tests);
});
