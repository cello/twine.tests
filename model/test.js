/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
	newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, strict: true,
	undef: true, white: true
*/
/*global define: false, require: false */

// configure requirejs
define([
	'./testBuilder',
	//'./testModel',
	//'./testRegistry'
],
function (Builder, Model, Registry) {
	'use strict';
	return {
		'test Builder': Builder,
		//'test Model': Model,
		//'test Registry': Registry
	};
});
