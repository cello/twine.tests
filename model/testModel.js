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
	'twine/model/Model',
	'twine/util/error',
	'promise'
], function (testCase, assert, Model, error, promise) {
	'use strict';
	return testCase({
		setUp: function () {
			var c = this.component = {};
			this.life = {
				resolve: this.spy(function () {
					return c;
				}),
				release: this.spy()
			};
			this.config = {
				id: 'id',
				lifecycle: this.life
			};
			this.m = new Model(this.config);
		},

		tearDown: function () {
			this.m.destroy();
		},

		'test model mixes in config and sets default properties': function () {
			var config = {
					extra: 'foo',
					id: 'id'
				},
				m = new Model(config);

			assert.equal(m.config, config);
			assert.equal(m.extra, config.extra);
			assert.notStrictEqual(m, config);
			assert.ok(m.deps !== null);
			assert.ok(m.mixin !== null);
			assert.ok(m.module !== null);
		},

		'test model constructs an id from service and name if no id provided': function () {
			var config = {
					service: 'service',
					name: 'name'
				},
				config2 = {
					id: 'id',
					service: 'service',
					name: 'name'
				},
				m = new Model(config),
				m2 = new Model(config2);

			assert.equal(m.id, [config.service, config.name].join('/'));
			assert.equal(m2.id, config2.id);
		},

		'test config must provide enough info to build an id': function () {
			var minimal = {
					service: 'service'
				},
				inadequate = {
					name: 'name'
				};

			assert.doesNotThrow(function () {
				new Model(minimal);
			});
			assert.throws(function () {
				new Model(inadequate);
			}, error.MissingId);
		},

		'test id is used as module if module is not specified': function () {
			var config = {
					id: 'some/module/id'
				},
				m = new Model(config);

			assert.equal(m.module, config.id);
		},

		'test model needs a lifecycle to resolve': function () {
			var config = {
					id: 'id'
				},
				m = new Model(config);

			assert.throws(function () {
				m.resolve();
			}, error.MissingLifecycle);
		},

		'test model uses lifecycle to resolve the component': function () {
			var test = this,
				args = {};

			return promise.when(test.m.resolve(args), function (actual) {
				var resolve = test.life.resolve;
				assert.ok(resolve.called);
				assert.ok(resolve.calledWithExactly(args));
				assert.equal(actual, test.component);
			});
		},

		'test resolve returns a promise': function () {
			var test = this,
				args = {},
				actual = test.m.resolve(args);

			assert.equal(typeof actual.then, 'function');
		},

		'test model emits "componentResolved" when component is resolved': function () {
			var listen = this.spy();

			this.m.on('componentResolved', listen);
			return promise.when(this.m.resolve(), function (component) {
				assert.ok(listen.called);
				assert.ok(listen.calledWithExactly(component));
			});
		},
		
		'test model needs a lifecycle to release': function () {
			var config = {
					id: 'id'
				},
				m = new Model(config);

			assert.throws(function () {
				m.release();
			}, error.MissingLifecycle);
		},
		
		'test model uses lifecycle to release the component': function () {
			var test = this,
				release = test.life.release,
				args = {};

			test.m.release(args);
			assert.ok(release.called);
		},
		
		'test model emits "componentReleased" when component is released': function () {
			var listen = this.spy(),
				instance = {};
			this.m.on('componentReleased', listen);
			
			this.m.release(instance);
			
			assert.ok(listen.called);
			assert.ok(listen.calledWithExactly(instance));
		},
		
		'test addMixin mixes a mixin into the mixin property': function () {
			var mixin = {
				foo: 'foo',
				bar: 'bar'
			};
			
			this.m.addMixin(mixin);
			
			assert.equal(this.m.mixin.foo, mixin.foo);
			assert.equal(this.m.mixin.bar, mixin.bar);
			assert.notStrictEqual(this.m.mixin, mixin);
		}
	});
});
