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
	'twine/factory/Fiber'
], function (testCase, assert, promise, Fiber) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.model = {
				factory: {
					foo: 'modules/foo',
					bar: 'modules/bar'
				}
			};
			this.next = this.spy();
			this.kernel = {
				modelBuilder: {
					addProcessor: this.spy()
				},
				resolve: this.spy()
			};
			this.fiber = new Fiber();
		},

		'test is a fiber': function () {
			assert.equal(typeof this.fiber.init, 'function');
			assert.equal(typeof this.fiber.terminate, 'function');
		},

		'test fiber is a model processor': function () {
			assert.equal(typeof this.fiber.process, 'function');
		},

		'test init adds a processor to the modelBuilder': function () {
			this.fiber.init(this.kernel);
			assert.ok(this.kernel.modelBuilder.addProcessor.calledWith(this.fiber));
		},

		'test process returns model for module that maps property names to factories': function () {
			return when(this.fiber.process(this.model, this.next), function (model) {
				var module = model.module;
				assert.equal(typeof module.foo, 'function');
				assert.equal(typeof module.bar, 'function');
			});
		},

		'test factories resolve components specified by model.factory': function () {
			var model = this.model,
				kernel = this.kernel;

			this.fiber.init(this.kernel);
			return when(this.fiber.process(this.model, this.next), function (m) {
				var module = m.module,
					args = {};

				return promise.when(module.foo(args), function (instance) {
					assert.ok(kernel.resolve.calledWith(model.factory.foo, args));
				});
			});
		}
	});
});
