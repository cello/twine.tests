define(function(require,exports){
	if(typeof console !== "undefined"){
		exports.print = function(){
			console.log.apply(console, arguments);
		}
	}
	exports.args = {};
});