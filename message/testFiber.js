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
	'twine/message/Fiber',
	'twine/model/Model',
	'twine/lifecycle/Singleton',
	'twine/message/ListenerProxy',
	'twine/message/InterceptorProxy'
], function (testCase, assert, promise, Fiber, Model, Singleton, ListenerProxy, InterceptorProxy) {
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

			this.router = {
				on: this.spy(),
				dispatch: this.spy(),
				intercept: this.spy()
			};

			this.fiber.router = this.router;
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

		'test listener adds a mixin for a dispatch property with dispatch: true': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model;

			model.dispatch = true;
			listener(model);

			return when(model.resolve(), function (instance) {
				assert.equal(typeof instance.dispatch, 'function');
			});
		},

		'test listener adds mixin for a custom property indicated by model.dispatch': function () {
			this.fiber.init(this.kernel);
			var prop = 'prop',
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model;

			model.dispatch = prop;
			listener(model);

			return when(model.resolve(), function (instance) {
				assert.equal(typeof instance[prop], 'function');
			});
		},

		'test listener adds a listener proxy for model.listen': function () {
			this.fiber.init(this.kernel);
			var Event = function () {},
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				proxy;

			model.listen = Event;
			listener(model);

			assert.ok(this.router.on.calledWith(Event));
			proxy = this.router.on.getCall(0).args[1];
			assert.ok(proxy instanceof ListenerProxy);
			assert.equal(proxy.model, model);
		},

		'test listener loads module indicated by model.listen and adds proxy': function () {
			this.fiber.init(this.kernel);
			var Event = function () {},
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				proxy;

			model.listen = 'abc';
			model.load = this.spy(function (deps, cb) {
				cb(Event);
			});
			listener(model);

			assert.ok(model.load.calledWith([model.listen]));
			assert.ok(this.router.on.calledWith(Event));
			proxy = this.router.on.getCall(0).args[1];
			assert.ok(proxy instanceof ListenerProxy);
			assert.equal(proxy.model, model);
		},

		'test listener adds an intercept proxy for model.intercept': function () {
			this.fiber.init(this.kernel);
			var Event = function () {},
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				proxy;

			model.intercept = Event;
			listener(model);

			assert.ok(this.router.intercept.calledWith(Event));
			proxy = this.router.intercept.getCall(0).args[1];
			assert.ok(proxy instanceof InterceptorProxy);
			assert.equal(proxy.model, model);
		},

		'test listener loads module indicated by model.intercept and adds proxy': function () {
			this.fiber.init(this.kernel);
			var Event = function () {},
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				proxy;

			model.intercept = 'abc';
			model.load = this.spy(function (deps, cb) {
				cb(Event);
			});
			listener(model);

			assert.ok(model.load.calledWith([model.intercept]));
			assert.ok(this.router.intercept.calledWith(Event));
			proxy = this.router.intercept.getCall(0).args[1];
			assert.ok(proxy instanceof InterceptorProxy);
			assert.equal(proxy.model, model);
		},

		'test listener adds publishers indicated by model.publish': function () {
			this.fiber.init(this.kernel);
			var prop = 'prop',
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model;

			model.publish = {
				pub: 'topic'
			};

			listener(model);

			return when(model.resolve(), function (instance) {
				assert.equal(typeof instance.pub, 'function');
			});
		},

		'test listener adds subscribers indicated by model.subscribe': function () {
			this.fiber.init(this.kernel);
			var prop = 'prop',
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				subscriber = {
					sub: this.spy()
				};

			model.subscribe = {
				sub: 'topic'
			};
			model.publish = {
				pub: 'topic'
			};
			model.addMixin(subscriber);
			listener(model);

			return when(model.resolve(), function (instance) {
				var obj = {},
					str = 'string';

				assert.ok(!instance.sub.called);
				instance.pub(obj, str);
				assert.ok(instance.sub.calledWith(obj, str));
			});
		},

		'test subscriber is removed when component is released': function () {
			this.fiber.init(this.kernel);
			var prop = 'prop',
				listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				subscriber = {
					sub: this.spy()
				},
				pubModel = new Model({
					id: 'publisher',
					module: this.spy(),
					kernel: this.kernel,
					publish: {
						pub: 'topic'
					}
				});

			pubModel.lifecycle = new Singleton(pubModel);
			model.subscribe = {
				sub: 'topic'
			};
			model.addMixin(subscriber);
			listener(model);
			listener(pubModel);

			return when(model.resolve(), function (instance) {
				return when(pubModel.resolve(), function (publisher) {
					assert.ok(!instance.sub.called);
					publisher.pub();
					assert.ok(instance.sub.calledOnce);
					model.release(instance);
					publisher.pub();
					assert.ok(instance.sub.calledOnce);
				});
			});
		}
	});
});
