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
	'twine/children/Fiber',
	'twine/model/Model',
	'twine/lifecycle/Singleton'
], function (testCase, assert, promise, Fiber, Model, Singleton) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			var instance = this.instance = {
					addChild: this.spy()
				},
				registry = this.registry = {
					a: {
						id: 'a'
					},
					b: {
						id: 'b'
					},
					c: {
						id: 'c'
					},
					parent: {
						addChild: this.spy()
					}
				};

			this.kernel = {
				modelRegistry: {
					on: this.spy()
				},
				addComponentModel: this.spy(),
				resolve: this.spy(function (id) {
					return registry[id];
				})
			};

			this.model = new Model({
				id: 'unique',
				module: instance,
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

		'test children are resolved and addChild is called for the instance': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				registry = this.registry,
				children = ['a', 'b', 'c'];

			model.children = children;
			listener(model);

			return when(model.resolve(), function (instance) {
				children.forEach(function (child, i) {
					assert.equal(instance.addChild.getCall(i).args[0], registry[child]);
				});
			});
		},

		'test parent is resolved and instance is added via addChild': function () {
			this.fiber.init(this.kernel);
			var listener = this.kernel.modelRegistry.on.getCall(0).args[1],
				model = this.model,
				registry = this.registry,
				kernel = this.kernel,
				p = 'parent';

			model.parent = p;
			listener(model);

			return when(model.resolve(), function (it) {
				assert.ok(kernel.resolve.calledWithExactly(p), 'parent should be resolved');
				assert.ok(registry[p].addChild.calledWithExactly(it), 'parent.addChild called');
			});
		}
	});
});
