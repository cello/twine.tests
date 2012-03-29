require({
	// configure loader to find twine to make loading the transform easier
	packages: [
		{
			name: 'twine',
			// XXX: once http://bugs.dojotoolkit.org/ticket/15103 is fixed this
			// line can become:
			//	location: '../exteranl/twine',
			location: require.nodeRequire('path').dirname(process.argv[1]) + '/../external/twine',
			main: 'Twine'
		}
	]
});


// this block is how we get dojo's build tool to use twine's transform
require([
	'build/buildControlDefault'
], function (bc) {
	// make the twine transform available - depends on config in previous block
	bc.transforms.twine = ['twine/build/transform', 'ast'];

	// add the twine transform to all transformJobs that have depsScan
	bc.transformJobs.forEach(function (transformJob) {
		var transforms = transformJob[1],
			index = transforms.indexOf('depsScan');

		// if 'depsScan' is in the list of transforms then...
		if (~index) {
			// add the twine transform before depsScan
			transforms.splice(index, 0, 'twine');
		}
	});
});



var profile = {
	releaseDir: 'release',

	layerOptimize: 'closure',
	stripConsole: 'all',
	mini: true,

	packages: [
		{
			name: 'dojo',
			location: 'external/dojo'
		},
		{
			name: 'twine',
			location: 'external/twine',
			main: 'Twine'
		}
	],

	layers: {
		// this is just to make dojo/dojo empty-ish
		'dojo/dojo': {
			customBase: true
		},
		'twine/Twine': {}
	}
};