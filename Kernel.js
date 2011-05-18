/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
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
	var originalRequire = require,
		isBrowser = typeof window !== "undefined";

	function browserOnly(test) {
		return function () {
			// for now, cause an error so that it draws attention when not in a browser
			assert.ok(isBrowser, 'browser only test');
			return test.apply(this, arguments);
		};
	}

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
			//require = originalRequire;
		},

		'test kernel builds a default model registry': function () {
			assert.ok(this.k.modelRegistry instanceof ModelRegistry);
		},

		'test kernel builds a default model builder': function () {
			assert.ok(this.k.modelBuilder instanceof ModelBuilder);
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
		}
	});
});
