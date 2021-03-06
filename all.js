/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

// configure requirejs
define([
	'./testTwine',
	'./testKernel',
	'./model/test',
	'./lifecycle/test',
	'./factory/test',
	'./autoResolver/test',
	'./navigation/test',
	'./message/test',
	'./children/test'
],
function (Twine, Kernel, Model, lifecycle, factory, autoResolver, navigation, message, children) {
	'use strict';
	return {
		'test Twine': Twine,
		'test Kernel': Kernel,
		'test Model': Model,
		'test lifecycle': lifecycle,
		'test factory': factory,
		'test auto resolver': autoResolver,
		'test navigation': navigation,
		'test message': message,
		'test children': children
	};
});
