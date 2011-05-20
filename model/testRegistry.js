/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
	newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, strict: true,
	undef: true, white: true
*/
/*global define: false, require: false */

define([
	'test/promiseTestCase',
	'assert',
	'twine/model/Registry',
	'twine/util/error',
	'twine/model/Model'
], function (testCase, assert, Registry, error, Model) {
	'use strict';
	return testCase({
		setUp: function () {
			this.r = new Registry();
			this.m = new Model({
				id: 'id'
			});
		},

		tearDown: function () {
			this.r.destroy();
		},

		'test has an addModel function': function () {
			assert.equal(typeof this.r.addModel, 'function');
		},

		'test has a getModel function': function () {
			assert.equal(typeof this.r.getModel, 'function');
		},

		'test has a destroy function': function () {
			assert.equal(typeof this.r.destroy, 'function');
		},

		'test registry is an event emitter': function () {
			assert.equal(typeof this.r.emit, 'function');
			assert.equal(typeof this.r.on, 'function');
		},

		'test models must have an id': function () {
			var model = {},
				registry = this.r;

			assert.throws(function () {
				registry.addModel(model);
			}, error.MissingId);
		},

		'test models must have unique ids': function () {
			var m1 = new Model({
					id: 'dup'
				}),
				m2 = new Model({
					id: 'dup'
				}),
				registry = this.r;

			registry.addModel(m1);
			assert.throws(function () {
				registry.addModel(m2);
			}, error.DuplicateModel);
		},

		'test model must have unique service/name combination': function () {
			var m1 = new Model({
					id: 'service1',
					service: 'service',
					name: 'name'
				}),
				m2 = new Model({
					id: 'service2',
					service: 'service'
				}),
				registry = this.r;

			registry.addModel(m1);
			assert.throws(function () {
				registry.addModel(m2);
			}, error.DuplicateServiceModel);
		},

		'test registry emits "modelAdded" when a model is added': function () {
			var modelAdded = this.spy(),
				model = this.m,
				actual;

			this.r.on('modelAdded', modelAdded);

			actual = this.r.addModel(model);

			assert.ok(modelAdded.called);
			assert.equal(modelAdded.getCall(0).args[0], model);
			assert.equal(actual, model);
		},

		'test getModel assumes a string as a request is for an id': function () {
			this.r.addModel(this.m);

			assert.equal(this.r.getModel(this.m.id), this.m);
		},

		'test getModel retrieves model by instance': function () {
			var instance = {};
			this.r.addModel(this.m);
			this.m.emit('componentConstructed', instance);

			assert.equal(this.r.getModel({
				instance: instance
			}), this.m);
		},

		'test getModel favors instance when specified': function () {
			var instance = {},
				m = new Model({
					id: 'alternative'
				});

			this.r.addModel(this.m);
			this.r.addModel(m);
			this.m.emit('componentConstructed', instance);

			assert.equal(this.r.getModel({
				instance: instance,
				id: m.id
			}), this.m);
		},

		'test getModel favors id over service': function () {
			var model = new Model({
					id: 'model',
					service: 'not'
				}),
				service = new Model({
					id: 'service',
					service: 'is'
				});

			this.r.addModel(model);
			this.r.addModel(service);

			assert.equal(this.r.getModel({
				id: 'model',
				service: 'is'
			}), model);
		},

		'test getModel retrieves models by service without name': function () {
			var service = new Model({
				id: 'service',
				service: 'helper'
			});

			this.r.addModel(service);

			assert.equal(this.r.getModel({
				service: 'helper'
			}), service);
		},

		'test getModel retrieves models by service and name': function () {
			var s1 = new Model({
					id: 's1',
					service: 'service'
				}),
				s2 = new Model({
					id: 's2',
					service: 'service',
					name: 'foo'
				});

			this.r.addModel(s1);
			this.r.addModel(s2);

			assert.equal(this.r.getModel({
				service: 'service',
				name: 'foo'
			}), s2);
		},

		'test destroy will destroy models': function () {
			var expectation = this.mock(this.m).expects('destroy').once();
			this.r.addModel(this.m);

			this.r.destroy();

			assert.ok(expectation.verify());
			this.m.destroy.restore();
		}
	});
});
