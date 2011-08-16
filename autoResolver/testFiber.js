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
	'twine/autoResolver/Fiber'
], function (testCase, assert, promise, Fiber) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.kernel = {
				modelRegistry: {
					on: this.spy()
				}
			};
			this.model = {
				resolve: this.spy()
			};
			this.fiber = new Fiber();
		},

		'test is a fiber': function () {
			assert.equal(typeof this.fiber.init, 'function');
			assert.equal(typeof this.fiber.terminate, 'function');
		},

		'test listens to modelRegistry modelAdded event': function () {
			this.fiber.init(this.kernel);
			assert.ok(this.kernel.modelRegistry.on.calledWith('modelAdded'));
		},

		'test listener resolves models with autoResolve: truthy': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1];

			this.model.autoResolve = false;
			listener(this.model);
			assert.ok(!this.model.resolve.called);

			this.model.autoResolve = true;
			listener(this.model);
			assert.ok(this.model.resolve.called);
		}
	});
});
