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
	'twine/navigation/Router',
	'twine/util/error'
], function (testCase, assert, promise, Router, error) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.router = new Router();
		},

		'test is an event listener': function () {
			assert.equal(typeof this.router.execute, 'function');
		},

		'test addRoute throws if handler is not a function': function () {
			var router = this.router;

			assert.throws(function () {
				router.addRoute('abc');
			}, error.MissingHandler);
		},

		'test addRoute returns a handle for removing the route': function () {
			var actual = this.router.addRoute('abc', function () {});

			assert.equal(typeof actual.remove, 'function');
		},

		'test execute calls handlers for routes that match the target': function () {
			var target = 'abc',
				handler = this.spy(),
				event = {
					target: target
				},
				handle = this.router.addRoute(target, handler);

			return promise.when(this.router.execute(event), function () {
				assert.ok(handler.calledWith(event, target));
			});
		},

		'test handle returned from addRoute removes handlers': function () {
			var target = 'abc',
				handler = this.spy(),
				event = {
					target: target
				},
				handle = this.router.addRoute(target, handler);

			handle.remove();
			return promise.when(this.router.execute(event), function () {
				assert.ok(!handler.called);
			});
		},

		'test RegExp can be used as route and captures are passed to handler': function () {
			var route = /^abc\d+/,
				handler = this.spy(),
				router = this.router,
				event = {
					target: 'abc'
				},
				handle = router.addRoute(route, handler);

			return promise.when(router.execute(event), function () {
				assert.ok(!handler.called);
				event.target = 'abc123';
				return promise.when(router.execute(event), function () {
					var match = event.target.match(route);
					match.unshift(event);
					assert.ok(handler.calledWith.apply(handler, match));
				});
			});
		},

		'test addRoute runs current route for new handlers': function () {
			var target = 'abc',
				handler = this.spy(),
				event = {
					target: target
				},
				router = this.router;

			return promise.when(this.router.execute(event), function () {
				assert.ok(!handler.called);
				router.addRoute(target, handler);
				assert.ok(handler.calledWith(event, target));
			});
		}
	});
});
