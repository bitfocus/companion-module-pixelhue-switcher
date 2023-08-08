const { combineRgb } = require('@companion-module/base')

const basicPresets = {
	take: {
		type: 'button',
		category: 'Basics',
		name: 'TAKE',
		style: {
			text: 'TAKE',
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'take',
						options: {},
					},
				],
			},
		],
		feedbacks: [],
	},
	cut: {
		type: 'button',
		category: 'Basics',
		name: 'CUT',
		style: {
			text: 'CUT',
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'cut',
						options: {},
					},
				],
			},
		],
		feedbacks: [],
	},
}

const displayPresets = {
	change_black: {
		type: 'button',
		category: 'Display',
		name: 'Toggle FTB',
		style: {
			text: 'Toggle FTB',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'change_black',
						options: {
							black: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'change_black',
						options: {
							black: '0',
						},
					},
				],
			},
		],
		feedbacks: [],
	},
	change_freeze: {
		type: 'button',
		category: 'Display',
		name: 'Toggle Freeze',
		style: {
			text: 'Toggle Freeze',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'change_freeze',
						options: {
							freeze: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'change_freeze',
						options: {
							freeze: '0',
						},
					},
				],
			},
		],
		feedbacks: [],
	},
}

const customPlayPresets = {
	'preset-play': {
		type: 'button',
		category: 'Presets',
		name: 'Preset',
		style: {
			text: 'Preset',
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 0, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'load_preset',
						options: {
							preset: 0,
						},
					},
				],
			},
		],
		feedbacks: [],
	},
}

const playPresets = {}
for (let i = 1; i <= 128; i++) {
	const preset = {
		type: 'button',
		category: 'Presets',
		name: 'Preset ' + i,
		style: {
			text: 'Preset\\n' + i,
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'load_preset',
						options: {
							preset: i,
						},
					},
				],
			},
		],
		feedbacks: [],
	}
	playPresets['preset-play' + i] = preset
}

exports.getPresetDefinitions = function () {
	return {
		...basicPresets,
		...displayPresets,
		...customPlayPresets,
		...playPresets,
	}
}
