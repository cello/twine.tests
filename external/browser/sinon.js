/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
*/
/*global define: false, require: false, sinon: false */

define([
	'order!test/external/sinon/lib/sinon.js',
	'order!test/external/sinon/lib/sinon/spy.js',
	'order!test/external/sinon/lib/sinon/stub.js',
	'order!test/external/sinon/lib/sinon/mock.js',
	'order!test/external/sinon/lib/sinon/collection.js',
	'order!test/external/sinon/lib/sinon/assert.js',
	'order!test/external/sinon/lib/sinon/sandbox.js',
	'order!test/external/sinon/lib/sinon/test.js',
	'order!test/external/sinon/lib/sinon/test_case.js',
	'order!test/external/sinon/lib/sinon/util/fake_timers.js'
],
function () {
	// sinon should have become a global
	return sinon;
});
