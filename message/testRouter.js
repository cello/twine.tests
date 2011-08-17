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
	'twine/message/Router',
	'twine/support/compose'
], function (testCase, assert, promise, Router, compose) {
	'use strict';

	var when = promise.when;

	return testCase({
		setUp: function () {
			this.Event = function () {};
			this.listener = {
				execute: this.spy(),
				results: this.spy(),
				error: this.spy()
			};
			this.SubClass = compose(this.Event, function () {}, {
				subclass: true
			});
			this.router = new Router();
		},

		'test on returns a handle for removing the listener': function () {
			var actual = this.router.on(this.Event, function () {});

			assert.equal(typeof actual.remove, 'function');
		},

		'test intercept returns a handle for removing the listener': function () {
			var actual = this.router.intercept(this.Event, function () {});

			assert.equal(typeof actual.remove, 'function');
		},

		'test listeners are called when messages are dispatched': function () {
			var listener = this.listener,
				event = new this.Event();

			this.router.on(this.Event, listener);

			this.router.dispatch(event);

			assert.ok(listener.execute.calledWith(event));
		},

		'test results is called after execute resolves': function () {
			var listener = this.listener,
				data = {},
				event = new this.Event();

			listener.execute = this.stub().returns(data);

			this.router.on(this.Event, listener);

			this.router.dispatch(event);

			assert.ok(listener.results.calledWith(data));
		},

		'test error is called if execute returns a rejected promise': function () {
			var dfd = promise.defer(),
				listener = this.listener,
				err = new Error(),
				event = new this.Event();

			listener.execute = this.stub().returns(dfd);
			dfd.reject(err);

			this.router.on(this.Event, listener);

			this.router.dispatch(event);

			assert.ok(listener.error.calledWith(err));
		},

		'test listeners are invoked for subclasses of events': function () {
			var listener = this.listener,
				event = new this.SubClass();

			this.router.on(this.Event, listener);

			this.router.dispatch(event);

			assert.ok(listener.execute.calledWith(event));
		},

		'test interceptors are called before listeners': function () {
			var listener = this.listener,
				event = new this.Event(),
				interceptor = {
					intercept: this.spy(function (e) {
						e.proceed();
					})
				};

			this.router.on(this.Event, listener);
			this.router.intercept(this.Event, interceptor);

			this.router.dispatch(event);

			assert.ok(interceptor.intercept.calledBefore(listener.execute));
			assert.ok(listener.execute.called);
			assert.equal(interceptor.intercept.getCall(0).args[0].msg, event);
		},

		'test listeners are not called if interceptors do not call proceed': function () {
			var listener = this.listener,
				event = new this.Event(),
				interceptor = {
					intercept: this.spy()
				};

			this.router.on(this.Event, listener);
			this.router.intercept(this.Event, interceptor);

			this.router.dispatch(event);

			assert.ok(interceptor.intercept.called);
			assert.ok(!listener.execute.called);
		},

		'test interceptors are called in reverse order': function () {
			var event = new this.Event(),
				interceptor1 = {
					intercept: this.spy(function (e) {
						e.proceed();
					})
				},
				interceptor2 = {
					intercept: this.spy(function (e) {
						e.proceed();
					})
				};

			this.router.intercept(this.Event, interceptor1);
			this.router.intercept(this.Event, interceptor2);

			this.router.dispatch(event);

			assert.ok(interceptor1.intercept.called);
			assert.ok(interceptor2.intercept.calledBefore(interceptor1.intercept));
		},

		'test listeners are not called when removed': function () {
			var listener = this.listener,
				event = new this.Event(),
				handle = this.router.on(this.Event, listener);

			handle.remove();
			this.router.dispatch(event);

			assert.ok(!listener.execute.called);
		},

		'test interceptors are not called when removed': function () {
			var event = new this.Event(),
				interceptor = {
					intercept: this.spy()
				},
				handle = this.router.intercept(this.Event, interceptor);

			handle.remove();
			this.router.dispatch(event);

			assert.ok(!interceptor.intercept.called);
		}
	});
});
