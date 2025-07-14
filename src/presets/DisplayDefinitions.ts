import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { PRESET_CATEGORY } from '../utils/constants.js'

export function getDisplatPresetDefinitions(): CompanionPresetDefinitions {
	return {
		swapCopy: {
			type: 'button',
			name: 'SwapOrCopy',
			category: PRESET_CATEGORY.DISPLAY,
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
							actionId: 'swapOrCopy',
							options: {
								swapCopy: '0',
							},
						},
					],
					up: [],
				},
				{
					down: [
						{
							actionId: 'swapOrCopy',
							options: {
								swapCopy: '1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'swapState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
					options: {},
				},
			],
		},
		matchPgm: {
			type: 'button',
			category: PRESET_CATEGORY.DISPLAY,
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
					up: [],
				},
			],
			feedbacks: [],
		},
	}
}
