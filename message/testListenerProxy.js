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
	'twine/message/ListenerProxy'
], function (testCase, assert, promise, ListenerProxy) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			var component = this.component = {
				execute: this.spy(),
				results: this.spy(),
				error: this.spy()
			};
			this.model = {
				resolve: this.spy(function () {
					// mock promise
					return {
						then: function (cb) {
							cb(component);
						}
					};
				}),
				release: this.spy()
			};
			this.proxy = new ListenerProxy(this.model);
		},

		'test is a listener': function () {
			var proxy = new ListenerProxy();

			assert.equal(typeof proxy.execute, 'function');
			assert.equal(typeof proxy.results, 'function');
			assert.equal(typeof proxy.error, 'function');
		},

		'test execute resolves component from model and calls execute': function () {
			var component = this.component,
				model = this.model,
				proxy = this.proxy,
				obj = {},
				str = 'string';

			// null out results and error to test release being called
			component.results = null;
			component.error = null;

			return when(proxy.execute(obj, str), function () {
				assert.ok(model.resolve.called);
				assert.ok(component.execute.calledWith(obj, str));
				assert.ok(model.release.calledWith(component));
			});
		},

		'test execute does not release if results or error are functions': function () {
			var model = this.model;

			this.component.error = null;

			return when(this.proxy.execute(), function () {
				assert.ok(!model.release.called);
			});
		},

		'test results and error do nothing if execute has not been called': function () {
			this.proxy.results();
			assert.ok(!this.component.results.called);

			this.proxy.error();
			assert.ok(!this.component.error.called);

			assert.ok(!this.model.resolve.called);
		},

		'test results works after execute has been called': function () {
			var model = this.model,
				proxy = this.proxy,
				component = this.component;

			return when(proxy.execute(), function () {
				var obj = {},
					str = 'string';

				proxy.results(str, obj);
				assert.ok(component.results.calledWith(str, obj));
				assert.ok(model.release.calledWith(component));
			});
		},

		'test error works after execute has been called': function () {
			var model = this.model,
				proxy = this.proxy,
				component = this.component;

			return when(proxy.execute(), function () {
				var obj = {},
					str = 'string';

				proxy.error(str, obj);
				assert.ok(component.error.calledWith(str, obj));
				assert.ok(model.release.calledWith(component));
			});
		}
	});
});
