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

define([
	'test/promiseTestCase',
	'assert',
	'twine/support/promise',
	'twine/message/InterceptorProxy'
], function (testCase, assert, promise, InterceptorProxy) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
		},

		'test is an interceptor': function () {
			var interceptor = new InterceptorProxy();

			assert.equal(typeof interceptor.intercept, 'function');
		},

		'test resolves component from model, calls intercept and releases component': function () {
			var component = {
					intercept: this.spy()
				},
				model = {
					resolve: this.spy(function () {
						// mock promise
						return {
							then: function (cb) {
								cb(component);
							}
						};
					}),
					release: this.spy()
				},
				interceptor = new InterceptorProxy(model),
				obj = {},
				str = 'string';

			interceptor.intercept(obj, str);
			assert.ok(model.resolve.called);
			assert.ok(component.intercept.calledWith(obj, str));
			assert.ok(model.release.calledWith(component));
		}
	});
});
