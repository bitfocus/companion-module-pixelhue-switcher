import { combineRgb } from '@companion-module/base'
import { isHttpDevice, isHttpDeviceWithDQ } from '../utils/index.js'

export const getFeedbacks = (instance) => {
	let feedbacks = {}

	feedbacks['ftb'] = {
		type: 'boolean',
		name: 'FTB Status Detection',
		description: 'Change the style when FTB is pressed.',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [],
		callback: () => instance.config.ftb === '1',
	}

	feedbacks['freeze'] = {
		type: 'boolean',
		name: 'Freeze Status Detection',
		description: 'Change the style when Freeze is pressed.',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [],
		callback: () => instance.config.freeze === '1',
	}

	feedbacks['pgm'] = {
		type: 'boolean',
		name: 'PGM Status Detection',
		description: 'Change the style when Load preset to PGM.',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			text: 'Load to\nPGM',
		},
		options: [],
		callback: () => instance.config.presetType === 'pgm',
	}

	feedbacks['screen'] = {
		type: 'boolean',
		name: 'screen',
		description: 'Change the style when Load preset to Screen',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			text: 'Load to\nScreen',
		},
		options: [],
		callback: (event) => {
			return instance.screenSelect[event.options.screenId] == 1 ? true : false
		},
	}

	feedbacks['layer'] = {
		type: 'boolean',
		name: 'layer',
		description: 'Change the style when Load preset to layer',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			text: 'Load to\nLayer',
		},
		options: [],
		callback: (event) => {
			return instance.layerSelect[event.options.layerId] == 1 ? true : false
		},
	}

	if (isHttpDevice(instance)) {
		feedbacks['swapCopy'] = {
			type: 'boolean',
			name: 'SwapCopy Status Detection',
			description: 'Change the style when swapCopy mode is pressed.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [],
			callback: () => instance.config.swapCopy === '1',
		}

		if (isHttpDeviceWithDQ(instance)) {
			feedbacks['mapping'] = {
				type: 'boolean',
				name: 'Mapping Status Detection',
				description: 'Change the style when mapping is pressed.',
				defaultStyle: {
					bgcolor: combineRgb(255, 0, 0),
				},
				options: [],
				callback: () => instance.config.mapping === '1',
			}
		}
	}

	return feedbacks
}
