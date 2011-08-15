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
	'twine/model/Builder',
	'twine/model/Model'
], function (testCase, assert, promise, ModelBuilder, Model) {
	'use strict';
	return testCase({
		setUp: function () {
			this.k = {};
			this.b = new ModelBuilder(this.k);
		},

		tearDown: function () {
			this.b.destroy();
		},

		'test has a process function': function () {
			assert.equal(typeof this.b.process, 'function');
		},

		'test has an addProcessor function': function () {
			assert.equal(typeof this.b.addProcessor, 'function');
		},

		'test has a destroy function': function () {
			assert.equal(typeof this.b.destroy, 'function');
		},

		'test processors are called in sequence': function () {
			var config = {
					id: 'id'
				},
				p1 = {
					process: this.spy(function (model, next) {
						return next();
					})
				},
				p2 = {
					process: this.spy(function (model, next) {
						return next();
					})
				};

			this.b.addProcessor(p1);
			this.b.addProcessor(p2);

			return promise.when(this.b.process(config), function (model) {
				assert.equal(model.config, config);
				assert.ok(p1.process.called);
				assert.ok(p2.process.called);
				assert.ok(p1.process.calledBefore(p2.process));
			});
		},

		'test processors must call next': function () {
			var config = {
					id: 'id'
				},
				p1 = {
					process: this.spy(function (model, next) {
						return model;
					})
				},
				p2 = {
					process: this.spy(function (model, next) {
						return next();
					})
				};

			this.b.addProcessor(p1);
			this.b.addProcessor(p2);

			return promise.when(this.b.process(config), function (model) {
				assert.equal(model.config, config);
				assert.ok(p1.process.called);
				assert.ok(!p2.process.called);
			});
		},

		'test processor can replace the model': function () {
			var config = {
					id: 'id'
				},
				intercept = {},
				p1 = {
					process: this.spy(function (model, next) {
						return next(intercept);
					})
				},
				p2 = {
					process: function (model, next) {
						assert.equal(model, intercept);
						return next();
					}
				};

			this.b.addProcessor(p1);
			this.b.addProcessor(p2);

			return promise.when(this.b.process(config), function (model) {
				assert.equal(model, intercept);
			});
		},

		'test model is returned when processor does not return a value': function () {
			var config = {
					id: 'id'
				},
				p1 = {
					process: this.spy()
				};

			this.b.addProcessor(p1);

			return promise.when(this.b.process(config), function (model) {
				assert.equal(model.config, config);
			});
		}
	});
});
