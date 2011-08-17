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
	'twine/navigation/Fiber',
	'twine/model/Model',
	'twine/lifecycle/Singleton'
], function (testCase, assert, promise, Fiber, Model, Singleton) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.kernel = {
				modelRegistry: {
					on: this.spy()
				},
				addComponentModel: this.spy()
			};

			this.model = new Model({
				id: 'unique',
				module: this.spy(),
				kernel: this.kernel
			});
			this.model.lifecycle = new Singleton(this.model);

			this.fiber = new Fiber();
		},

		'test is a fiber': function () {
			assert.equal(typeof this.fiber.init, 'function');
			assert.equal(typeof this.fiber.terminate, 'function');
		},

		'test is a commissioner': function () {
			assert.equal(typeof this.fiber.commission, 'function');
		},

		'test listens to modelRegistry modelAdded event': function () {
			this.fiber.init(this.kernel);
			assert.ok(this.kernel.modelRegistry.on.calledWith('modelAdded'));
		},

		'test listener adds a mixin for a navigate property with navigate: true': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model;

			model.navigate = true;
			listener(model);

			return when(model.resolve(), function (instance) {
				assert.equal(typeof instance.navigate, 'function');
			});
		},

		'test listener adds mixin for a custom property indicated by model.navigate': function () {
			this.fiber.init(this.kernel);
			var prop = 'prop',
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model;

			model.navigate = prop;
			listener(model);

			return when(model.resolve(), function (instance) {
				assert.equal(typeof instance[prop], 'function');
			});
		},

		'test listener commissions models with routes': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				route = 'abcd',
				model = this.model,
				addRoute = this.stub(this.fiber.router, 'addRoute');

			model.route = route;
			model.addMixin({
				route: this.spy()
			});
			listener(model);

			return when(model.resolve(), function (instance) {
				assert.ok(addRoute.calledWith(route));
			});
		},

		'test routes removed when instance is deconstructed': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				route = 'abcd',
				model = this.model,
				remove = this.stub(),
				addRoute = this.stub(this.fiber.router, 'addRoute', function () {
					return {
						remove: remove
					};
				});

			model.route = route;
			model.addMixin({
				route: this.spy()
			});
			listener(model);

			return when(model.resolve(), function (instance) {
				model.release(instance);
				assert.ok(remove.called);
			});
		}
	});
});
