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
	'twine/lifecycle/Manager',
	'twine/lifecycle/Singleton'
], function (testCase, assert, promise, Manager, Singleton) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.next = this.spy(function (model) {
				return model;
			});

			this.model = {
				on: this.spy(),
				deconstruct: this.spy()
			};

			this.manager = new Manager();
		},

		'test lifecycle manager is a model processor': function () {
			assert.equal(typeof this.manager.process, 'function');
		},

		'test process returns a promise': function () {
			var actual = this.manager.process(this.model, this.next);

			assert.equal(typeof actual.then, 'function');
		},

		'test lifestyle defaults to Singleton': function () {
			return when(this.manager.process(this.model, this.next), function (model) {
				assert.ok(model.lifecycle);
				assert.ok(model.lifecycle instanceof Singleton);
			});
		},

		'test loads lifestyle and creates model.lifecycle as an instance': function () {
			var model = this.model,
				Lifestyle = this.spy(),
				id = 'abc',
				load = model.load = this.spy(function (deps, cb) {
					cb(Lifestyle);
				});

			model.lifestyle = id;
			return when(this.manager.process(model, this.next), function (model) {
				assert.ok(load.calledWith([id]));
				assert.ok(model.lifecycle instanceof Lifestyle);
			});
		},

		'test lifestyle is destroyed on model destroyed event': function () {
			var model = this.model,
				destroy = this.spy(),
				Lifestyle = this.spy(function () {
					return {
						destroy: destroy
					};
				}),
				id = 'abc',
				load = model.load = this.spy(function (deps, cb) {
					cb(Lifestyle);
				});

			model.lifestyle = id;
			return when(this.manager.process(model, this.next), function () {
				var args = model.on.getCall(0).args;
				assert.equal(args[0], 'destroyed');
				assert.ok(!destroy.called);
				args[1]();
				assert.ok(destroy.called);
			});
		}
	});
});
