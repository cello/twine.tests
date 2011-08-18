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
	'twine',
	'twine/Kernel',
	'twine/support/promise',
	'twine/util/error'
], function (testCase, assert, Twine, Kernel, promise, error) {
	'use strict';

	return testCase({
		setUp: function () {
			this.k = new Kernel();
			this.t = new Twine({
				kernel: this.k
			});
		},

		tearDown: function () {
			this.t.destroy();
		},

		'test assigns a default name': function () {
			var t = new Twine();
			assert.ok(t.name);
		},

		'test uses name passed to the constructor': function () {
			var n = 'name',
				t = new Twine({
					name: n
				});

			assert.equal(t.name, n);
		},

		'test assigns a default kernel': function () {
			var t = new Twine();
			assert.ok(t.kernel);
			assert.ok(t.kernel instanceof Kernel);
		},

		'test uses kernel passed to the constructor': function () {
			var k = new Kernel(),
				t = new Twine({
					kernel: k
				});

			assert.equal(t.kernel, k);
		},

		'test assigns a default load function': function () {
			var t = new Twine();
			assert.ok(t.load);
			assert.equal(typeof t.load, 'function');
		},

		'test uses load passed to the constructor': function () {
			var load = function () {},
				t = new Twine({
					load: load
				});
			assert.equal(t.load, load);
		},

		'test uses load passed to the config': function () {
			var load = this.spy(function (deps, cb) {
					cb();
				}),
				relative = './abc';

			return promise.when(this.t.configure({
				load: load,
				fibers: [relative]
			}), function (container) {
				assert.ok(load.called, 'not using load from config');
				var spyCall = load.getCall(0);
				assert.equal(spyCall.args[0][0], relative);
			});
		},

		'test addFiber calls addFiber on kernel': function () {
			var expected = {},
				mock = this.mock(this.k).expects("addFiber").returns(expected).once(),
				actual;

			actual = this.t.addFiber();
			mock.verify();
			assert.equal(actual, expected);
		},

		'test configure returns a promise that resolves to the container': function () {
			var t = this.t,
				actual = t.configure();

			return promise.when(actual, function (container) {
				assert.equal(typeof actual.then, 'function');
				assert.equal(container, container);
			});
		},

		'test fibers, installers, components are configured in sequence': function () {
			var addFiber = this.stub(this.t, 'addFiber'),
				install = this.stub(this.t, 'install'),
				addComponentModel = this.stub(this.t.kernel, 'addComponentModel'),
				fiber = this.spy(),
				installer = this.spy(),
				component = this.spy();

			return promise.when(this.t.configure({
				fibers: [fiber],
				installers: [installer],
				components: [component]
			}), function (container) {
				assert.ok(addFiber.called);
				assert.ok(install.called);
				assert.ok(addComponentModel.called);
				assert.ok(addFiber.calledBefore(install));
				assert.ok(install.calledBefore(addComponentModel));
			});
		},

		'test fibers specified as strings are module ids to be loaded': function () {
			var id = 'abc/foo',
				load = this.stub(this.t, "load", function (deps, cb) {
					cb();
				});

			return promise.when(this.t.configure({
				fibers: [id]
			}), function (container) {
				assert.ok(load.called);
				var spyCall = load.getCall(0);
				assert.equal(spyCall.args[0][0], id);
			});
		},

		'test fibers specified as functions are factories to be executed': function () {
			var fiber = {},
				factory = this.stub().returns(fiber),
				addFiber = this.mock(this.t).expects('addFiber').once().withExactArgs(fiber);

			return promise.when(this.t.configure({
				fibers: [factory]
			}), function (container) {
				assert.ok(factory.called, 'fiber factory not called');
				assert.ok(addFiber.verify());
			});
		},

		'test fibers specified as objects are considered instances': function () {
			var fiber = {},
				addFiber = this.mock(this.t).expects('addFiber').once().withExactArgs(fiber);

			return promise.when(this.t.configure({
				fibers: [fiber]
			}), function (container) {
				assert.ok(addFiber.verify());
			});
		},

		'test installers specified as strings are treated as module ids': function () {
			var id = 'abc/foo',
				load = this.stub(this.t, "load", function (deps, cb) {
					cb();
				});

			return promise.when(this.t.configure({
				installers: [id]
			}), function (container) {
				assert.ok(load.called);
				var spyCall = load.getCall(0);
				assert.equal(spyCall.args[0][0], id);
			});
		},

		'test installers specified as functions are factories to be executed': function () {
			var installer = {},
				factory = this.stub().returns(installer),
				install = this.mock(this.t).expects('install').once().withExactArgs(installer);

			return promise.when(this.t.configure({
				installers: [factory]
			}), function (container) {
				assert.ok(factory.called, 'fiber factory not called');
				assert.ok(install.verify());
			});
		},

		'test installers specified as objects are considered instances': function () {
			var installer = {},
				install = this.mock(this.t).expects('install').once().withExactArgs(installer);

			return promise.when(this.t.configure({
				installers: [installer]
			}), function (container) {
				assert.ok(install.verify());
			});
		},

		'test installer.install is called and passed container': function () {
			var t = this.t,
				install = this.mock().once().withExactArgs(t),
				installer = {
					install: install
				};

			return promise.when(this.t.configure({
				installers: [installer]
			}), function (container) {
				assert.ok(install.verify());
				assert.equal(container, t);
			});
		},

		'test install returns a promise': function () {
			var t = this.t,
				install = this.mock().once().withExactArgs(t),
				installer = {
					install: install
				},
				actual = this.t.install(installer);

			return promise.when(actual, function (container) {
				assert.ok(install.verify());
				assert.equal(container, t);
				assert.equal(typeof actual.then, 'function');
			});
		},

		'test component configs are added to the kernel': function () {
			var component = {},
				addComponentModel =
					this.mock(this.k).expects('addComponentModel').once().withExactArgs(component);

			return promise.when(this.t.configure({
				components: [component]
			}), function (container) {
				assert.ok(addComponentModel.verify());
			});
		},

		'test resolve delegates to kernel': function () {
			var spec = {},
				args = {},
				expected = {},
				actual,
				resolve = this.mock(this.k).expects('resolve').once().withExactArgs(spec, args)
					.returns(expected);

			actual = this.t.resolve(spec, args);
			assert.ok(resolve.verify());
			assert.equal(actual, expected);
		},

		'test release delegates to kernel': function () {
			var component = {},
				expected = {},
				actual,
				release = this.mock(this.k).expects('release').once().withExactArgs(component)
					.returns(expected);

			actual = this.t.release(component);
			assert.ok(release.verify());
			assert.equal(actual, expected);
		},

		'test destroy delegates to kernel': function () {
			var expected = {},
				actual,
				destroy = this.mock(this.k).expects('destroy').once().returns(expected);

			actual = this.t.destroy();
			assert.ok(destroy.verify());
			assert.equal(actual, expected);

			this.k.destroy.restore();
		},

		'test calling public APIs after container is destroyed throws': function () {
			var t = new Twine();

			t.destroy();

			assert.throws(function () {
				t.configure();
			}, error.ContainerDestroyed);
			assert.throws(function () {
				t.install();
			}, error.ContainerDestroyed);
			assert.throws(function () {
				t.resolve();
			}, error.ContainerDestroyed);
			assert.throws(function () {
				t.release();
			}, error.ContainerDestroyed);
		}
	});
});
