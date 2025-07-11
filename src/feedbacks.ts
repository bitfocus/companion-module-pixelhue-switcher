import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { LoadIn } from './interfaces/Preset.js'
import { DropdownChoice } from '@companion-module/base'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		globalLoadIn: {
			name: 'Global Load In State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'loadIn',
					type: 'dropdown',
					label: 'Load In',
					default: LoadIn.preview,
					choices: [
						{
							id: LoadIn.preview,
							label: 'Preview',
						},
						{
							id: LoadIn.program,
							label: 'Program',
						},
					],
				},
			],
			callback: (feedback) => {
				return self.globalLoadPresetIn == +feedback.options.loadIn!
			},
		},
		presetState: {
			name: 'Preset State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Preset',
					id: 'presetId',
					default: 1,
					choices: self.presets
						.sort((preset1, preset2) => {
							if (preset1.keyPosition[0] > preset2.keyPosition[0]) return 1
							if (preset1.keyPosition[0] < preset2.keyPosition[0]) return -1
							return 0
						})
						.map((preset): DropdownChoice => {
							return {
								id: preset.presetId,
								label: `${preset.keyPosition[0]}. ${preset.general.name}`,
							}
						}),
				},
				{
					id: 'loadIn',
					type: 'dropdown',
					label: 'Loaded In',
					default: LoadIn.program,
					choices: [
						{
							id: LoadIn.preview,
							label: 'Preview',
						},
						{
							id: LoadIn.program,
							label: 'Program',
						},
					],
				},
			],
			callback: (feedback) => {
				const preset = self.presets.find((preset) => {
					return preset.presetId === feedback.options.presetId!
				})
				return preset?.presetIdObj.playType === +feedback.options.loadIn! || preset?.presetIdObj.playType === 6
			},
		},
		swapState: {
			name: 'Swap State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.swapEnabled
			},
		},
		screenState: {
			name: 'Screen Selection State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.select === 1
			},
		},
		screenFreezeState: {
			name: 'Screen Freeze State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.freeze === 1
			},
		},
		screenFtbState: {
			name: 'Screen FTB State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.ftb.enable === 1
			},
		},
		globalFtbState: {
			name: 'Global FTB State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.globalFtb === 1
			},
		},
		globalFreezeState: {
			name: 'Global Freeze State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.globalFreeze === 1
			},
		},
	})
}
