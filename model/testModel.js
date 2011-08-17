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
	'twine/model/Model',
	'twine/util/error',
	'twine/support/promise',
	'twine/Kernel'
], function (testCase, assert, Model, error, promise, Kernel) {
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
				lifecycle: this.life,
				load: this.spy(),
				kernel: new Kernel(),
				module: this.spy()
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
				var m = new Model(minimal);
			});
			assert.throws(function () {
				var m = new Model(inadequate);
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
		},

		'test construct returns a promise': function () {
			var actual = this.m.construct();

			assert.equal(typeof actual.then, 'function');
		},

		'test construct creates an instance of a model that is a function': function () {
			var module = this.m.module;

			return promise.when(this.m.construct(), function (instance) {
				assert.ok(module.calledWithNew);
			});
		},

		'test construct loads unloaded modules': function () {
			var id = this.m.module = 'abc',
				module = {},
				load = this.m.load = this.spy(function (deps, cb) {
					cb(module);
				});

			return promise.when(this.m.construct(), function (instance) {
				assert.equal(instance, module);
				assert.ok(load.calledWith([id]));
			});
		},

		'test construct resolves all dependencies for the model': function () {
			var model = {
					resolve: this.spy()
				},
				deps = this.m.deps = {
					a: 'a',
					b: 'b',
					c: 'c'
				},
				registry = this.m.kernel.modelRegistry = {
					a: {
						resolve: this.spy(function () {
							return this;
						})
					},
					b: {
						resolve: this.spy(function () {
							return this;
						})
					},
					c: {
						resolve: this.spy(function () {
							return this;
						})
					},
					getModel: this.spy(function (spec) {
						return this[spec];
					})
				};

			return promise.when(this.m.construct(), function (instance) {
				assert.equal(instance.a, registry.a);
				assert.equal(instance.b, registry.b);
				assert.equal(instance.c, registry.c);
			});
		},

		'test construct mixes in args': function () {
			var args = {
					a: {},
					b: {}
				};

			return promise.when(this.m.construct(args), function (instance) {
				assert.equal(instance.a, args.a);
				assert.equal(instance.b, args.b);
			});
		},

		'test construct emits componentConstructed': function () {
			var componentConstructed = this.spy();

			this.m.on('componentConstructed', componentConstructed);

			return promise.when(this.m.construct(), function (actual) {
				assert.ok(componentConstructed.calledWith(actual));
			});
		},

		'test construct supports instanceof': function () {
			var Constructor = this.m.module = function () {};

			return promise.when(this.m.construct(), function (instance) {
				assert.ok(instance instanceof Constructor);
			});
		},

		'test resolve applies commissioners': function () {
			var model = this.m,
				commissioner = {
					commission: this.spy(function (instance, model) {
						return instance;
					})
				};

			this.m.addCommissioner(commissioner);

			return promise.when(this.m.resolve(), function (instance) {
				assert.ok(commissioner.commission.calledWith(instance, model));
			});
		},

		'test deconstruct emits componentDeconstructed': function () {
			var model = this.m,
				deconstructed = this.spy();

			model.on('componentDeconstructed', deconstructed);

			return promise.when(model.construct(), function (instance) {
				return promise.when(model.deconstruct(instance), function (actual) {
					assert.equal(actual, instance);
					assert.ok(deconstructed.calledWith(actual));
				});
			});
		},

		'test release applies decommissioners': function () {
			var model = this.m,
				commissioner = {
					decommission: this.spy(function (instance, model) {
						console.log('\n\nCALLED\n\n');
						return instance;
					})
				};

			model.addCommissioner(commissioner);

			return promise.when(model.resolve(), function (instance) {
				return promise.when(model.release(instance), function (actual) {
					assert.ok(commissioner.decommission.calledWith(actual, model));
				});
			});
		},

		'test addCommissioner returns handle to remove commissioner': function () {
			var model = this.m,
				commissioner = {
					commission: this.spy(function (instance, model) {
						return instance;
					}),
					decommission: this.spy(function (instance, model) {
						return instance;
					})
				},
				handle = model.addCommissioner(commissioner);

			assert.equal(typeof handle.remove, 'function');

			return promise.when(model.resolve(), function (instance) {
				assert.ok(commissioner.commission.calledWith(instance, model));
				return promise.when(model.release(instance), function (actual) {
					assert.ok(commissioner.decommission.calledWith(actual, model));
					handle.remove();
					return promise.when(model.resolve(), function (instance) {
						assert.ok(commissioner.commission.calledOnce);
						return promise.when(model.release(instance), function (actual) {
							assert.ok(commissioner.decommission.calledOnce);
						});
					});
				});
			});
		},

		'test destroy emits destroyed': function () {
			var spy = this.spy(),
				model = this.m;

			model.on('destroyed', spy);

			model.destroy();

			assert.ok(spy.calledWith(model));
		}
	});
});
