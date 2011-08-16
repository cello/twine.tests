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
	'twine/lifecycle/Singleton'
], function (testCase, assert, promise, Singleton) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			var Class = this.Class = function () {};
			this.model = {
				construct: this.spy(function () {
					return new Class();
				}),
				release: this.spy(),
				deconstruct: this.spy()
			};
			this.lifestyle = new Singleton(this.model);
		},

		'test Singleton is a lifestyle': function () {
			var lifestyle = this.lifestyle;

			assert.equal(typeof lifestyle.resolve, 'function');
			assert.equal(typeof lifestyle.release, 'function');
			assert.equal(typeof lifestyle.destroy, 'function');
		},

		'test resolve returns results of model.construct': function () {
			var args = {},
				Class = this.Class,
				model = this.model;

			return when(this.lifestyle.resolve(args), function (instance) {
				assert.ok(model.construct.calledWith(args));
				assert.ok(instance instanceof Class);
			});
		},

		'test resolve returns same instance every time': function () {
			var lifestyle = this.lifestyle;

			return when(lifestyle.resolve(), function (expected) {
				return when(lifestyle.resolve(), function (actual) {
					assert.equal(actual, expected);
				});
			});
		},

		'test resolve returns same instance even after release': function () {
			var lifestyle = this.lifestyle;

			return when(lifestyle.resolve(), function (expected) {
				lifestyle.release();
				return when(lifestyle.resolve(), function (actual) {
					assert.equal(actual, expected);
				});
			});
		},

		'test destroy releases model if not yet released': function () {
			var lifestyle = this.lifestyle,
				model = this.model;

			return when(lifestyle.resolve(), function (instance) {
				lifestyle.destroy();
				assert.ok(model.release.called);
			});
		},

		'test destroy deconstructs model': function () {
			var lifestyle = this.lifestyle,
				model = this.model;

			return when(lifestyle.resolve(), function (instance) {
				lifestyle.destroy();
				assert.ok(model.deconstruct.calledWith(instance));
			});
		}
	});
});
