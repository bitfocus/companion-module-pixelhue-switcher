import type { ModuleInstance } from './main.js'
import { DropdownChoice } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import {
	getLayerBySelection,
	getLayerSelectionOptions,
	getScreensBySelection,
	getScreenSelectionOptions,
} from './actionUtils.js'
import { LayerBounds, LayerUMD } from './interfaces/Layer.js'
import { HTTPError } from 'got'
import { SCREEN_TYPE } from './interfaces/Screen.js'
import { TestPatternGridType, TEST_PATTERN_TYPE_CHOICES } from './interfaces/TestPattern.js'

export function updateCompanionActions(self: ModuleInstance): void {
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
					const screensToTake = self.screens.filter((screen) => screen.select === 1)
					await self.apiClient?.take(
						screensToTake,
						self.swapEnabled,
						!!event.options.customTimeEnabled!,
						event.options.customTimeEnabled ? parseInt(parsedTime) : self.effectTime,
					)
				} catch (error: any) {
					self.log('error', (error as HTTPError).message)
				}
			},
		},
		cut: {
			name: 'CUT',
			options: [],
			callback: async () => {
				try {
					const screensToTake = self.screens.filter((screen) => screen.select === 1)
					const result = await self.apiClient?.cut(screensToTake, 0, self.swapEnabled)
					console.log(result)
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
					const screensToTake = self.screens.filter((screen) => screen.select === 1)
					await self.apiClient?.cut(screensToTake, 1)
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
				...getScreenSelectionOptions(self, [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX]),
			],
			callback: async (event) => {
				try {
					const screens = getScreensBySelection(self, event)
					let ftb = !!event.options.ftb
					if (event.options.ftb === -1) {
						ftb = self.globalFtb !== 1
					}
					await self.apiClient?.ftb(screens, ftb, self.effectTime)
					self.globalFtb = self.globalFtb !== 1 ? 1 : 0
					self.checkFeedbacks('globalFtbState')
				} catch {
					self.log('error', 'FTB send error')
				}
			},
		},
		swapOrCopy: {
			name: 'Toggle Swap/Copy on Take/Cut',
			options: [],
			callback: async () => {
				self.swapEnabled = !self.swapEnabled
				self.checkFeedbacks('swapState')
			},
		},
		freeze: {
			name: 'Freeze/Unfreeze',
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
				...getScreenSelectionOptions(self, [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX]),
			],
			callback: async (event) => {
				try {
					const screens = getScreensBySelection(self, event)
					let freeze = !!event.options.freeze
					if (event.options.freeze === -1) {
						freeze = self.globalFreeze !== 1
					}
					await self.apiClient?.freeze(screens, freeze)
					self.globalFreeze = self.globalFreeze !== 1 ? 1 : 0
					self.checkFeedbacks('globalFreezeState')
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
							if (preset1.serial > preset2.serial) return 1
							if (preset1.serial < preset2.serial) return -1
							return 0
						})
						.map((preset): DropdownChoice => {
							return {
								id: preset.serial,
								label: `${preset.serial}. ${preset.name}`,
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

					const preset = self.presets.find((preset) => preset.serial === event.options.presetId!)
					if (!preset) return
					const result = await self.apiClient?.loadPreset(preset, sceneType!)
					self.log('debug', JSON.stringify(result))
				} catch (error: any) {
					self.log('error', (error as HTTPError).message)
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
				const action: number = <number>event.options.action
				const screenIndex = self.screens.findIndex((screen) => screen.screenId === event.options.screenId)
				if (action >= 0) {
					self.screens[screenIndex].select = event.options.action === 1 ? 1 : 0
				} else {
					self.screens[screenIndex].select = self.screens[screenIndex].select !== 1 ? 1 : 0
				}
				self.checkFeedbacks('screenState')
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
				...getLayerSelectionOptions(self, true),
			],
			callback: async (event, context) => {
				try {
					const selectedLayer = await getLayerBySelection(self, event, context)
					if (!selectedLayer) return

					const result = await self.apiClient?.bringSelectedTo(selectedLayer.layerId, <number>event.options.bringTo)
					console.log(result)
				} catch {
					self.log('error', 'bring_to send error')
				}
			},
		},
		selectLayer: {
			name: 'Select Layer',
			options: [...getLayerSelectionOptions(self, false)],
			callback: async (event, context) => {
				const selectedLayer = await getLayerBySelection(self, event, context)
				if (!selectedLayer) return
				self.layers = self.layers.map((layer) => {
					layer.selected = layer.layerId === selectedLayer.layerId ? 1 : 0
					return layer
				})
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
				const parsedTime = parseInt(await context.parseVariablesInString(<string>event.options.time))
				if (isNaN(parsedTime)) return
				self.effectTime = parsedTime
			},
		},
		applyLayerPreset: {
			name: 'Apply layer preset',
			options: [
				{
					type: 'dropdown',
					label: 'Layer Preset',
					id: 'layerPresetId',
					default: self.screens[0].screenId,
					choices: self.layerPresets.map((layerPreset): DropdownChoice => {
						return {
							id: layerPreset.layerPresetId,
							label: layerPreset.general.name,
						}
					}),
				},
				...getLayerSelectionOptions(self, true),
			],
			callback: async (event, context) => {
				try {
					const layer = await getLayerBySelection(self, event, context)
					const layerPreset = self.layerPresets.find((layerPreset) => {
						return layerPreset.layerPresetId === event.options.layerPresetId
					})

					if (layer === undefined || layerPreset === undefined) return

					await self.apiClient?.applyLayerPreset(layer.layerId, layerPreset)
				} catch (error: any) {
					self.log('error', 'applyLayerPreset send error')
					self.log('error', error)
				}
			},
		},
		changeLayerBounds: {
			name: 'Move and resize layer',
			options: [
				{
					type: 'textinput',
					label: 'X',
					id: 'x',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Y',
					id: 'y',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Width',
					id: 'width',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Height',
					id: 'height',
					useVariables: true,
				},
				...getLayerSelectionOptions(self, true),
			],
			callback: async (event, context) => {
				try {
					const layer = await getLayerBySelection(self, event, context)
					const x = parseInt(await context.parseVariablesInString(<string>event.options.x))
					const y = parseInt(await context.parseVariablesInString(<string>event.options.y))
					const width = parseInt(await context.parseVariablesInString(<string>event.options.width))
					const height = parseInt(await context.parseVariablesInString(<string>event.options.height))

					const layerBounds: LayerBounds = {
						x,
						y,
						width,
						height,
					}

					if (layer === undefined) return

					await self.apiClient?.applyLayerBounds(layer.layerId, layerBounds)
				} catch (error: any) {
					self.log('error', 'applyLayerBounds send error')
					self.log('error', error)
				}
			},
		},
		toggleUmd: {
			name: 'Toggle UMD on Layer',
			options: [
				{
					type: 'dropdown',
					id: 'layerId',
					label: 'Layer',
					default: 0,
					choices: self.layers
						.filter((layer) => {
							const screen = self.screens.find((screen) => {
								return screen.screenId === layer.layerIdObj.attachScreenId
							})
							return screen?.screenIdObj.type === 8
						})
						.map((layer): DropdownChoice => {
							const screen = self.screens.find((screen) => {
								return screen.screenId === layer.layerIdObj.attachScreenId
							})

							return {
								id: layer.layerId,
								label: `${screen?.general.name} - ${layer.source.general.sourceName}`,
							}
						}),
				},
			],
			callback: async (event) => {
				try {
					const layer = self.layers.find((layer) => {
						return layer.layerId === event.options.layerId
					})

					if (layer === undefined) return

					const umd = layer.UMD.map((umd): LayerUMD => {
						return {
							...umd,
							enable: umd.enable === 1 ? 0 : 1,
						}
					})

					console.log(umd)

					await self.apiClient?.applyUMD(layer.layerId, umd)
				} catch (error: any) {
					self.log('error', 'toggleUmd send error')
					self.log('error', error)
				}
			},
		},
		inputOnLayer: {
			name: 'Set Input on Layer',
			options: [
				{
					type: 'dropdown',
					id: 'inputId',
					label: 'Input',
					default: '',
					choices: self.getInterfaces(2, 0).map((interfaceO) => {
						return {
							id: interfaceO.interfaceId,
							label: interfaceO.general.name,
						}
					}),
				},
				...getLayerSelectionOptions(self, true, [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX]),
			],
			callback: async (event, context) => {
				const layer = await getLayerBySelection(self, event, context)
				const input = self.interfaces.find((interfaceO) => {
					return interfaceO.interfaceId === event.options.inputId
				})
				if (layer === undefined || input === undefined) return

				try {
					await self.apiClient?.setInputOnLayer(layer, input)
				} catch (error: any) {
					self.log('error', 'inputOnLayer send error')
					self.log('error', error)
				}
			},
		},
		testPattern: {
			name: 'Set test pattern',
			options: [
				{
					type: 'multidropdown',
					id: 'interfaceIds',
					label: 'Connectors',
					default: [],
					choices: self.interfaces
						.sort((a, b) => {
							return a.general.name.localeCompare(b.general.name)
						})
						.map((interfaceO): DropdownChoice => {
							return {
								id: interfaceO.interfaceId,
								label: `${interfaceO.general.name} (${interfaceO.interfaceId})`,
							}
						}),
				},
				{
					type: 'dropdown',
					id: 'enable',
					label: 'Enable',
					default: 1,
					choices: [
						{ id: 1, label: 'Enable' },
						{ id: 0, label: 'Disable' },
					],
				},
				{
					type: 'dropdown',
					id: 'patternType',
					label: 'Pattern type',
					default: TEST_PATTERN_TYPE_CHOICES[0].id,
					choices: TEST_PATTERN_TYPE_CHOICES.map((pattern): DropdownChoice => {
						return {
							id: pattern.id,
							label: pattern.label,
						}
					}),
				},
				{
					type: 'textinput',
					id: 'brightness',
					label: 'Brightness (0-100)',
					default: '50',
					required: true,
					useVariables: true,
				},
				{
					type: 'dropdown',
					id: 'gridType',
					label: 'Grid mode',
					default: TestPatternGridType.Density,
					choices: [
						{ id: TestPatternGridType.Density, label: 'Density level (1-8)' },
						{ id: TestPatternGridType.Spacing, label: 'Spacing in pixels' },
					],
				},
				{
					type: 'textinput',
					id: 'grid',
					label: 'Grid value',
					default: '5',
					required: true,
					useVariables: true,
					tooltip:
						'If grid mode is density, use 1-8. If spacing, specify pixels (min 1, max quarter of connector width).',
				},
				{
					type: 'textinput',
					id: 'gridLineWidth',
					label: 'Grid line width (px)',
					default: '2',
					required: true,
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'speed',
					label: 'Animation speed',
					default: '1',
					required: true,
					useVariables: true,
				},
			],
			callback: async (event, context) => {
				try {
					if (!Array.isArray(event.options.interfaceIds) || event.options.interfaceIds.length === 0) {
						self.log('error', 'Test pattern: select at least one connector')
						return
					}

					const interfaceIds = event.options.interfaceIds.map((id) => Number(id)).filter((id) => !isNaN(id))
					if (interfaceIds.length === 0) {
						self.log('error', 'Test pattern: connector selection could not be parsed')
						return
					}

					const parseNumericOption = async (
						optionId: string,
						label: string,
						clamp?: { min?: number; max?: number },
					) => {
						const raw = await context.parseVariablesInString(String(event.options[optionId] ?? ''))
						const value = Number(raw)
						if (!Number.isFinite(value)) {
							self.log('error', `Test pattern: ${label} must be a number (received "${raw}")`)
							return null
						}
						let parsed = Math.trunc(value)
						if (clamp?.min !== undefined && parsed < clamp.min) {
							parsed = clamp.min
						}
						if (clamp?.max !== undefined && parsed > clamp.max) {
							parsed = clamp.max
						}
						return parsed
					}

					const brightness = await parseNumericOption('brightness', 'brightness', { min: 0, max: 100 })
					if (brightness === null) return

					const normalizeGridType = (value: unknown): TestPatternGridType => {
						const numericValue = Number(value)
						if (numericValue === Number(TestPatternGridType.Spacing)) {
							return TestPatternGridType.Spacing
						}
						return TestPatternGridType.Density
					}
					const selectedGridType = normalizeGridType(event.options.gridType)
					const grid = await parseNumericOption('grid', 'grid value', {
						min: selectedGridType === TestPatternGridType.Density ? 1 : 1,
						max: selectedGridType === TestPatternGridType.Density ? 8 : undefined,
					})
					if (grid === null) return
					const gridLineWidth = await parseNumericOption('gridLineWidth', 'grid line width', { min: 1 })
					if (gridLineWidth === null) return
					const speed = await parseNumericOption('speed', 'speed', { min: 0 })
					if (speed === null) return

					const rawPatternType = Number(event.options.patternType ?? TEST_PATTERN_TYPE_CHOICES[0].id)
					const selectedPatternType =
						TEST_PATTERN_TYPE_CHOICES.find((choice) => {
							return choice.id === rawPatternType
						})?.id ?? TEST_PATTERN_TYPE_CHOICES[0].id

					await self.apiClient?.setTestPattern(interfaceIds, {
						enable: Number(event.options.enable as number) === 1 ? 1 : 0,
						type: selectedPatternType,
						bright: brightness,
						grid,
						gridType: selectedGridType,
						gridLineWidth,
						speed,
					})
				} catch (error: any) {
					self.log('error', `testPattern send error: ${(error as HTTPError).message ?? error}`)
				}
			},
		},
	})
}
