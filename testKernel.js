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
	'twine/Kernel',
	'promise',
	'twine/util/error',
	'twine/model/Registry',
	'twine/model/Builder'
], function (testCase, assert, Kernel, promise, error, ModelRegistry, ModelBuilder) {
	'use strict';
	return testCase({
		setUp: function () {
			this.builder = new ModelBuilder();
			this.registry = new ModelRegistry();
			this.k = new Kernel({
				modelBuilder: this.builder,
				modelRegistry: this.registry
			});
		},

		tearDown: function () {
			this.k.destroy();
		},

		'test kernel builds a default model registry': function () {
			var k = new Kernel();
			assert.ok(k.modelRegistry instanceof ModelRegistry);
		},

		'test kernel builds a default model builder': function () {
			var k = new Kernel();
			assert.ok(k.modelBuilder instanceof ModelBuilder);
		},

		'test kernel accepts an alternative model registry': function () {
			var r = {},
				k = new Kernel({
					modelRegistry: r
				});

			assert.equal(k.modelRegistry, r);
		},

		'test kernel accepts an alternative model builder': function () {
			var b = {},
				k = new Kernel({
					modelBuilder: b
				});

			assert.equal(k.modelBuilder, b);
		},

		'test fiber must have an id': function () {
			var fiber = {},
				k = this.k;

			assert.throws(function () {
				k.addFiber(fiber);
			}, error.MissingId);
		},

		'test fiber must have a unique id': function () {
			var f1 = {
					id: 'dup',
					init: function () {}
				},
				f2 = {
					id: 'dup',
					init: function () {}
				},
				k = this.k;

			k.addFiber(f1);
			assert.throws(function () {
				k.addFiber(f2);
			}, error.DuplicateFiber);
		},

		'test fiber is initialized when added': function () {
			var expected = {},
				actual,
				init = this.mock().once().withExactArgs(this.k).returns(expected),
				fiber = {
					id: 'fiber',
					init: init
				};

			actual = this.k.addFiber(fiber);
			assert.ok(init.verify());
			assert.equal(actual, expected);
		},

		'test addComponentModel processes config and adds model to the registry': function () {
			var config = {},
				model = {},
				process = this.mock(this.builder).expects('process').once()
					.withExactArgs(config).returns(model),
				addModel = this.mock(this.registry).expects('addModel').once()
					.withExactArgs(model).returns(model);

			return promise.when(this.k.addComponentModel(config), function (m) {
				assert.ok(process.verify());
				assert.ok(addModel.verify());
				assert.equal(m, model, 'model should be resolved');
			});
		},

		'test resolve gets model from registry and resolves it': function () {
			var spec = {},
				args = {},
				instance = {},
				model = {
					resolve: this.mock().once().withExactArgs(args).returns(instance)
				},
				getModel = this.mock(this.registry).expects('getModel').once()
					.withExactArgs(spec).returns(model);

			return promise.when(this.k.resolve(spec, args), function (component) {
				assert.ok(model.resolve.verify());
				assert.ok(getModel.verify());
				assert.equal(component, instance);
			});
		},

		'test release gets model from registry and releases it': function () {
			var instance = {},
				expected = {},
				model = {
					release: this.mock().once().returns(expected)
				},
				getModel = this.mock(this.registry).expects('getModel').once().returns(model);

			return promise.when(this.k.release(instance), function (actual) {
				assert.ok(model.release.verify());
				assert.ok(getModel.verify());
				assert.equal(getModel.getCall(0).args[0].instance, instance);
				assert.equal(actual, expected);
			});
		},

		'test destroy terminates fibers': function () {
			var fiber = {
				id: 'terminate',
				init: this.spy(),
				terminate: this.spy()
			};

			this.k.addFiber(fiber);
			this.k.destroy();

			assert.ok(fiber.terminate.called);
		},

		'test destroys model registry': function () {
			var destroy = this.mock(this.registry).expects('destroy').once();

			this.k.destroy();
			assert.ok(destroy.verify());
			this.registry.destroy.restore();
		},

		'test destroys model builder': function () {
			var destroy = this.mock(this.builder).expects('destroy').once();

			this.k.destroy();
			assert.ok(destroy.verify());
			this.builder.destroy.restore();
		}
	});
});
