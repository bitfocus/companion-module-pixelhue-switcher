import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { PRESET_CATEGORY } from '../utils/constants.js'

export function getLayerDefinitions(): CompanionPresetDefinitions {
	return {
		bringFarward: {
			type: 'button',
			category: PRESET_CATEGORY.LAYERS,
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
							actionId: 'bringTo',
							options: {
								bringTo: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		bringBackward: {
			type: 'button',
			category: PRESET_CATEGORY.LAYERS,
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
							actionId: 'bringTo',
							options: {
								bringTo: 2,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		bringToFront: {
			type: 'button',
			category: PRESET_CATEGORY.LAYERS,
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
							actionId: 'bringTo',
							options: {
								bringTo: 3,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		bringToBack: {
			type: 'button',
			category: PRESET_CATEGORY.LAYERS,
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
							actionId: 'bringTo',
							options: {
								bringTo: 4,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
	}
}
