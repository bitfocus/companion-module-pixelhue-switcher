import { combineRgb } from '@companion-module/base'
import { isHttpDevice, isHttpDeviceWithDQ } from '../utils/index.js'
import { DEVICE_PRESETS } from '../utils/constant.js'

const displayPresets = {
	take: {
		type: 'button',
		category: 'Display',
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
		category: 'Display',
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
	ftb: {
		type: 'button',
		category: 'Display',
		name: 'FTB',
		style: {
			text: 'FTB',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'ftb',
						options: {
							ftb: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'ftb',
						options: {
							ftb: '0',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'ftb',
				style: {
					bgcolor: combineRgb(255, 0, 0),
				},
				options: {},
			},
		],
	},

	freeze: {
		type: 'button',
		category: 'Display',
		name: 'Freeze',
		style: {
			text: 'Freeze',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'freeze',
						options: {
							freeze: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'freeze',
						options: {
							freeze: '0',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'freeze',
				style: {
					bgcolor: combineRgb(255, 0, 0),
				},
				options: {},
			},
		],
	},

	// presetType: 2: PGM, 4: PVW (http)
	// presetType: 1: PGM, 0: PVW (cmd)
	presetType: {
		type: 'button',
		category: 'Display',
		name: 'presetType',
		style: {
			text: 'Load to\nPVW',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'presetType',
						options: {
							presetType: 'pgm',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'presetType',
						options: {
							presetType: 'pvw',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'pgm',
				style: {
					bgcolor: combineRgb(255, 0, 0),
					text: 'Load to\nPGM',
				},
				options: {},
			},
		],
	},
}

const swapCopy = {
	type: 'button',
	name: 'SwapCopy',
	category: 'Display',
	style: {
		text: 'Swap\nCopy',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'swapCopy',
					options: {
						swapCopy: '0',
					},
				},
			],
		},
		{
			down: [
				{
					actionId: 'swapCopy',
					options: {
						swapCopy: '1',
					},
				},
			],
		},
	],
	feedbacks: [
		{
			feedbackId: 'swapCopy',
			style: {
				bgcolor: combineRgb(255, 0, 0),
			},
			options: {},
		},
	],
}

const matchPgm = {
	type: 'button',
	category: 'Display',
	name: 'MatchPGM',
	style: {
		text: 'Match\nPGM',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'matchPgm',
					options: {},
				},
			],
		},
	],
	feedbacks: [],
}

// Take Time 旋钮
const takeTime = {
	type: 'button',
	category: 'Display',
	name: 'TakeTime',
	style: {
		text: 'Take\nTime',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			rotate_left: [
				{
					actionId: 'takeTimeLeft',
					options: {
						direction: 'left',
					},
				},
			],
			rotate_right: [
				{
					actionId: 'takeTimeRight',
					options: {
						direction: 'right',
					},
				},
			],
		},
	],
	options: {
		rotaryActions: true,
	},
	feedbacks: [],
}

// Take Time Left
const takeTimeLeft = {
	type: 'button',
	category: 'Display',
	name: 'Take\nTime-',
	previewStyle: {
		text: 'Take\nTime-',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	style: {
		text: 'Time-',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'takeTimeLeft',
					options: {
						direction: 'left',
					},
				},
			],
		},
	],
}

// Take Time Right
const takeTimeRight = {
	type: 'button',
	category: 'Display',
	name: 'Take\nTime+',
	previewStyle: {
		text: 'Take\nTime+',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	style: {
		text: 'Time+',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'takeTimeRight',
					options: {
						direction: 'right',
					},
				},
			],
		},
	],
}

// 输出定位开关，按钮文本Mapping
const mapping = {
	type: 'button',
	name: 'Mapping',
	category: 'Display',
	style: {
		text: 'Mapping',
		size: '16',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'mapping',
					options: {
						mapping: '1', // 开启
					},
				},
			],
		},
		{
			down: [
				{
					actionId: 'mapping',
					options: {
						mapping: '0', // 关闭
					},
				},
			],
		},
	],
	feedbacks: [
		{
			feedbackId: 'mapping',
			style: {
				bgcolor: combineRgb(255, 0, 0),
			},
			options: {},
		},
	],
}


const bringTo = {
	bringFarward: {
		type: 'button',
		category: 'Layers',
		name: 'Bring Farward',
		style: {
			text: 'Bring Farward',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 128, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'bring_to',
						options: {
							bringId: 1
						},
					},
				],
			},
		],
		feedbacks: [],
	},
	bringBackward: {
		type: 'button',
		category: 'Layers',
		name: 'Bring Backward',
		style: {
			text: 'Bring Backward',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 128, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'bring_to',
						options: {
							bringId: 2
						},
					},
				],
			},
		],
		feedbacks: [],
	},
	bringToFront: {
		type: 'button',
		category: 'Layers',
		name: 'Bring To Front',
		style: {
			text: 'Bring To Front',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 128, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'bring_to',
						options: {
							bringId: 3
						},
					},
				],
			},
		],
		feedbacks: [],
	},
	bringToBack: {
		type: 'button',
		category: 'Layers',
		name: 'Bring To Back',
		style: {
			text: 'Bring To Back',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 128, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'bring_to',
						options: {
							bringId: 4
						},
					},
				],
			},
		],
		feedbacks: [],
	},
	

// F系列场景
const getFseriesPresets = (num) => {
	const playPresets = {}
	for (let i = 1; i <= num; i++) {
		const preset = {
			type: 'button',
			category: 'Presets',
			name: 'Preset ' + i,
			style: {
				text: 'Preset \n' + i,
				size: '18',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'preset',
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
	return playPresets

}

export const getPresetDefinitions = function (instance) {
	let basicPresets = {}
	if (isHttpDevice(instance)) {

		Object.assign(displayPresets, { swapCopy, matchPgm, takeTime, takeTimeLeft, takeTimeRight }, bringTo)

		basicPresets = { ...displayPresets, swapCopy, matchPgm, takeTime, takeTimeLeft, takeTimeRight }

		if (isHttpDeviceWithDQ(instance)) {
			basicPresets = { ...basicPresets, mapping }
		}
	} else {
		// F系列场景生成
		const presetNum = parseInt(DEVICE_PRESETS[instance.config.modelId]) ?? 128
		const fSeriesPresets = getFseriesPresets(presetNum)
		basicPresets = { ...displayPresets, ...fSeriesPresets }
	}

	return basicPresets
}
