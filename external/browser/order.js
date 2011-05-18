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

define([],
function () {
	var q = [],
		pSlice = Array.prototype.slice;

	function go() {
		var next = q[0];
		if (next) {
			load.apply(null, next);
		}
	}

	function load(target, req, done) {
		req([req.toUrl(target)], function (it) {
			// let the caller know we've loaded the module
			done(it);
			// shift it out of the q
			q.shift();
			// see if there's any more to do
			go();
		});
	}

	return {
		load: function () {
			q.push(arguments);
			// if we're the only thing in the q then load
			if (q.length === 1) {
				go();
			}
		}
	};
});
