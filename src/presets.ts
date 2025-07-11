import type { ModuleInstance } from './main.js'
import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'

export function UpdatePresets(self: ModuleInstance): void {
	const presetsPresetDefinitions: CompanionPresetDefinitions = {}

	self.presets.forEach((preset) => {
		/* Load in Preview */
		presetsPresetDefinitions[`preset${preset.keyPosition[0]}Preview`] = {
			type: 'button',
			name: `Preset ${preset.keyPosition[0]} Load (Preview)`,
			category: 'Load Preset in Preview',
			style: {
				text: `$(${self.id}:preset_${preset.keyPosition[0]}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.presetId,
								loadIn: LoadIn.preview,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.preview,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.program,
					},
				},
			],
		}
		/* Load in Program */
		presetsPresetDefinitions[`preset${preset.keyPosition[0]}Program`] = {
			type: 'button',
			name: `Preset ${preset.keyPosition[0]} Load (Program)`,
			category: 'Load Preset in Program',
			style: {
				text: `$(${self.id}:preset_${preset.keyPosition[0]}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.presetId,
								loadIn: LoadIn.program,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.program,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.program,
					},
				},
			],
		}
		/* Load using Global Setting */
		presetsPresetDefinitions[`preset${preset.keyPosition[0]}Global`] = {
			type: 'button',
			name: `Preset ${preset.keyPosition[0]} Load (Global)`,
			category: 'Load Preset using Global Setting',
			style: {
				text: `$(${self.id}:preset_${preset.keyPosition[0]}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.presetId,
								loadIn: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.preview,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.presetId,
						loadIn: LoadIn.program,
					},
				},
			],
		}
	})

	const screensPresetDefinitions: CompanionPresetDefinitions = {}

	self.screens.forEach((screen) => {
		screensPresetDefinitions[`toggleScreen${screen.screenId}`] = {
			type: 'button',
			name: `Toggle Screen ${screen.screenId} Selection`,
			category: 'Toggle Screen Selection',
			style: {
				text: `$(${self.id}:screen_${screen.screenId}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectScreen',
							options: {
								screenId: screen.screenId,
								action: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'screenState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						screenId: screen.screenId,
					},
				},
			],
		}
	})

	self.setPresetDefinitions({
		...presetsPresetDefinitions,
		...screensPresetDefinitions,
		take: {
			type: 'button',
			name: 'TAKE',
			category: 'Control',
			style: {
				text: 'TAKE',
				size: 24,
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
					up: [],
				},
			],
			feedbacks: [],
		},
		cut: {
			type: 'button',
			name: 'CUT',
			category: 'Control',
			style: {
				text: 'CUT',
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'cut',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		freeze: {
			type: 'button',
			name: 'Freeze',
			category: 'Control',
			style: {
				text: 'Freeze',
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'freeze',
							options: {
								freeze: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalFreezeState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {},
				},
			],
		},
		ftb: {
			type: 'button',
			name: 'FTB',
			category: 'Control',
			style: {
				text: 'FTB',
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'ftb',
							options: {
								ftb: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalFtbState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {},
				},
			],
		},
		globalLoadIn: {
			type: 'button',
			name: 'Global Load In',
			category: 'Control',
			style: {
				text: `$(${self.id}:global_load_in_short)`,
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggleGlobalLoadPreset',
							options: {
								loadIn: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalLoadIn',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						loadIn: LoadIn.program,
					},
				},
				{
					feedbackId: 'globalLoadIn',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						loadIn: LoadIn.preview,
					},
				},
			],
		},
	})
}
