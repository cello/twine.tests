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