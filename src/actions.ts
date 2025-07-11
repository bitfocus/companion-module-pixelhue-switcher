import type { ModuleInstance } from './main.js'
import { DropdownChoice } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		take: {
			name: 'TAKE',
			options: [
				{
					type: 'checkbox',
					label: 'Custom time',
					id: 'customTimeEnabled',
					default: false,
				},
				{
					type: 'textinput',
					label: 'Time',
					id: 'time',
					isVisibleExpression: '$(options:customTimeEnabled)',
					required: true,
					default: '500',
					useVariables: true,
				},
			],
			callback: async (event, context) => {
				try {
					const parsedTime = await context.parseVariablesInString(<string>event.options.time)
					await self.apiClient?.take(!!event.options.customTimeEnabled!, parseInt(parsedTime))
				} catch {
					self.log('error', 'take send error')
				}
			},
		},
		cut: {
			name: 'CUT',
			options: [],
			callback: async () => {
				try {
					await self.apiClient?.cut()
				} catch {
					self.log('error', 'cut send error')
				}
			},
		},
		matchPgm: {
			name: 'Match PGM',
			options: [],
			callback: async () => {
				try {
					await self.apiClient?.cut(1)
				} catch {
					self.log('error', 'cut send error')
				}
			},
		},
		ftb: {
			name: 'Fade to black',
			options: [
				{
					type: 'dropdown',
					label: 'FTB',
					id: 'ftb',
					default: -1,
					choices: [
						{
							id: -1,
							label: 'Toggle',
						},
						{
							id: 0,
							label: 'Enable',
						},
						{
							id: 1,
							label: 'Disable',
						},
					],
				},
			],
			callback: async (event) => {
				try {
					let ftb = !!event.options.ftb
					if (event.options.ftb === -1) {
						ftb = self.globalFtb !== 1
					}
					await self.apiClient?.ftb(ftb, 700)
				} catch {
					self.log('error', 'FTB send error')
				}
			},
		},
		swapOrCopy: {
			name: 'Toggle Swap/Copy on Take/Cut',
			options: [],
			callback: async () => {
				try {
					await self.apiClient?.swap(!self.swapEnabled)
				} catch {
					self.log('error', 'Swap/Copy send error')
				}
			},
		},
		freeze: {
			name: 'Freeze/Unfreeze selected screens',
			options: [
				{
					type: 'dropdown',
					label: 'Freeze',
					id: 'freeze',
					default: -1,
					choices: [
						{
							id: -1,
							label: 'Toggle',
						},
						{
							id: 0,
							label: 'Unfreeze',
						},
						{
							id: 1,
							label: 'Freeze',
						},
					],
				},
			],
			callback: async (event) => {
				try {
					let freeze = !!event.options.freeze
					if (event.options.freeze === -1) {
						freeze = self.globalFreeze !== 1
					}
					await self.apiClient?.freeze(freeze)
				} catch {
					self.log('error', 'FTB send error')
				}
			},
		},
		toggleGlobalLoadPreset: {
			name: 'Change global Preset load destination',
			options: [
				{
					type: 'dropdown',
					label: 'Load in',
					id: 'loadIn',
					default: 0,
					choices: [
						{
							id: 0,
							label: 'Toggle',
						},
						{
							id: 1,
							label: 'Preview',
						},
						{
							id: 2,
							label: 'Program',
						},
					],
				},
			],
			callback: async (event) => {
				switch (event.options.loadIn) {
					case 0:
						self.globalLoadPresetIn = self.globalLoadPresetIn === LoadIn.preview ? LoadIn.program : LoadIn.preview
						break
					case 1:
						self.globalLoadPresetIn = LoadIn.preview
						break
					case 2:
						self.globalLoadPresetIn = LoadIn.program
						break
				}
				self.setVariableValues({
					global_load_in: self.globalLoadPresetIn === LoadIn.preview ? 'Preview' : 'Program',
					global_load_in_short: self.globalLoadPresetIn === LoadIn.preview ? 'PVW' : 'PGM',
					global_load_in_program: self.globalLoadPresetIn === LoadIn.program,
					global_load_in_preview: self.globalLoadPresetIn === LoadIn.preview,
				})
				self.checkFeedbacks('globalLoadIn')
			},
		},
		loadPreset: {
			name: 'Load Preset',
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
					type: 'dropdown',
					label: 'Load in',
					id: 'loadIn',
					default: 0,
					choices: [
						{
							id: 0,
							label: 'Use global setting',
						},
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
			callback: async (event) => {
				try {
					let sceneType: number
					if (event.options.loadIn === 0) {
						sceneType = +self.globalLoadPresetIn
					} else {
						sceneType = +event.options.loadIn!
					}

					await self.apiClient?.loadPreset(+event.options.presetId!, sceneType!)
				} catch {
					self.log('error', 'FTB send error')
				}
			},
		},
		selectScreen: {
			name: 'Change Screen selection',
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
				{
					type: 'dropdown',
					label: 'Action',
					id: 'action',
					default: -1,
					choices: [
						{
							id: -1,
							label: 'Toggle',
						},
						{
							id: 0,
							label: 'Deselect',
						},
						{
							id: 1,
							label: 'Select',
						},
					],
				},
			],
			callback: async (event) => {
				try {
					const action: number = <number>event.options.action
					let screenSelection: boolean
					if (action >= 0) {
						screenSelection = event.options.action === 1
					} else {
						const screen = self.screens.find((screen) => screen.screenId === event.options.screenId)
						screenSelection = screen?.select !== 1
					}
					await self.apiClient?.selectScreen(+event.options.screenId!, screenSelection)
				} catch {
					self.log('error', 'take send error')
				}
			},
		},
		bringTo: {
			name: 'Bring selected layer to',
			options: [
				{
					type: 'dropdown',
					label: 'Bring to',
					id: 'bringTo',
					default: 1,
					choices: [
						{ id: 1, label: 'Bring Forward' },
						{ id: 2, label: 'Bring Backward' },
						{ id: 3, label: 'Bring to Front' },
						{ id: 4, label: 'Bring to Back' },
					],
				},
			],
			callback: async (event) => {
				try {
					const selectedLayer = self.layers.find((layer) => {
						return layer.selected === 1
					})

					if (!selectedLayer) return

					await self.apiClient?.bringSelectedTo(selectedLayer.layerId, <number>event.options.bringTo)
				} catch {
					self.log('error', 'bring_to send error')
				}
			},
		},
		selectLayer: {
			name: 'Select Layer',
			options: [
				{
					type: 'dropdown',
					label: 'Layer',
					id: 'layerId',
					default: 1,
					choices: self.layers.map((layer): DropdownChoice => {
						const screenName =
							self.screens.find((screen) => screen.screenId === layer.layerIdObj.attachScreenId)?.general?.name ?? ''
						const sceneType = layer.layerIdObj.sceneType === 2 ? 'PGM' : layer.layerIdObj.sceneType === 4 ? 'PVW' : ''

						return {
							id: layer.layerId,
							label: `${screenName} - ${sceneType} ${layer.general.name}`,
						}
					}),
				},
			],
			callback: async (event) => {
				try {
					await self.apiClient?.selectLayer(+event.options.layerId!, self.layers)
				} catch {
					self.log('error', 'take send error')
				}
			},
		},
		setEffectTime: {
			name: 'Set effect time',
			options: [
				{
					type: 'textinput',
					label: 'Time',
					id: 'time',
					required: true,
					default: '500',
					useVariables: true,
				},
			],
			callback: async (event, context) => {
				try {
					const parsedTime = await context.parseVariablesInString(<string>event.options.time)
					await self.apiClient?.setEffectTime(parseInt(parsedTime))
				} catch {
					self.log('error', 'take send error')
				}
			},
		},
	})
}
