import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'composeState',
			file: pkg.browser,
			format: 'umd'
		},
	},

	{
		input: 'src/index.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
		]
	}
];
