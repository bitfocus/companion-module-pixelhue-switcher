import type { ModuleInstance } from './main.js'
import { DropdownChoice } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import {
	buildInterfaceLookup,
	getInputSourceChoices,
	getLayerBySelection,
	getLayerSelectionOptions,
	getScreensBySelection,
	getScreenSelectionOptions,
} from './actionUtils.js'
import { LayerBounds, LayerUMD } from './interfaces/Layer.js'
import { HTTPError } from 'got'
import { SCREEN_TYPE } from './interfaces/Screen.js'
import { SourceBackup } from './interfaces/SourceBackup.js'
import {
	TEST_PATTERN_TYPE_CHOICES,
	SCREEN_TEST_PATTERN_TYPE_CHOICES,
	SPEED_LEVEL_CHOICES,
	TestPatternValue,
	TestPatternPayload,
	TestPatternGridType,
} from './interfaces/TestPattern.js'
import { applyPresetScreenSelection } from './utils/screenSelection.js'
import { backupEntryHasOfflineSource } from './utils/backupDisplay.js'

export function updateCompanionActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		take: {
			name: 'TAKE',
			description: 'Perform a TAKE on global selected screens',
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
					required: false,
					default: '500',
					useVariables: true,
				},
			],
			callback: async (event, context) => {
				try {
					const parsedTime = await context.parseVariablesInString(String(event.options.time ?? '500'))
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
		takeSingleScreen: {
			name: 'TAKE Single Screen',
			description: 'Perform a TAKE on a single screen from dropdown',
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
					required: false,
					default: '500',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: self.screens[0].screenId,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: async (event, context) => {
				try {
					const parsedTime = await context.parseVariablesInString(String(event.options.time ?? '500'))
					const screensToTake = self.screens.filter((screen) => event.options.screenId === screen.screenId)
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
		takeMultipleScreen: {
			name: 'TAKE Multiple Screen',
			description: 'Perform a TAKE on chosen screen',
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
					required: false,
					default: '500',
					useVariables: true,
				},
				{
					type: 'multidropdown',
					label: 'Screen',
					id: 'screenId',
					default: self.screens.length ? [self.screens[0].screenId] : [],
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: async (event, context) => {
				try {
					const parsedTime = await context.parseVariablesInString(String(event.options.time ?? '500'))

					const selectedScreenIds = (event.options.screenId ?? []) as number[]

					const screensToTake = self.screens.filter((screen) => selectedScreenIds.includes(screen.screenId))

					if (screensToTake.length === 0) {
						self.log('warn', 'Take called with no screens selected')
						return
					}

					await self.apiClient?.take(
						screensToTake,
						self.swapEnabled,
						!!event.options.customTimeEnabled!,
						event.options.customTimeEnabled ? parseInt(parsedTime) : self.effectTime,
					)
				} catch (error: any) {
					self.log('error', error.message)
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
					applyPresetScreenSelection(self, preset)
					await self.apiClient?.loadPreset(preset, sceneType!)
					await self.apiClient?.selectScreens(self.screens)
					self.checkFeedbacks('screenState')
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
				if (screenIndex < 0) {
					self.log('warn', `selectScreen called with unknown screenId: ${String(event.options.screenId)}`)
					return
				}
				if (action >= 0) {
					self.screens[screenIndex].select = event.options.action === 1 ? 1 : 0
				} else {
					self.screens[screenIndex].select = self.screens[screenIndex].select !== 1 ? 1 : 0
				}

				try {
					await self.apiClient?.selectScreens(self.screens)
				} catch (error: any) {
					self.log('error', (error as HTTPError).message)
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
					if (!selectedLayer) {
						self.log('warn', 'bringTo: no layer matched selection')
						return
					}

					await self.apiClient?.bringSelectedTo(selectedLayer.layerId, <number>event.options.bringTo)
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
					choices: getInputSourceChoices(self, () => self.updateActions()),
				},
				...getLayerSelectionOptions(self, true, [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX]),
			],
			callback: async (event, context) => {
				const layer = await getLayerBySelection(self, event, context)
				if (layer === undefined) return

				const inputId = String(event.options.inputId)
				if (inputId.startsWith('interface_')) {
					const interfaceId = Number(inputId.replace('interface_', ''))
					const input = self.interfaces.find((interfaceO) => {
						return interfaceO.interfaceId === interfaceId
					})
					if (input === undefined) return

					await self.apiClient?.setInputOnLayer(layer, input)
				} else if (inputId.startsWith('crop_')) {
					const cropSourceId = Number(inputId.replace('crop_', ''))
					const cropSource = self.cropSources.find((cs) => {
						return cs.cropId === cropSourceId
					})

					if (cropSource === undefined) return

					if (!cropSource.cropIdObj || cropSource.cropIdObj.sourceId === undefined) {
						return
					}

					const mainSource = self.interfaces.find((int) => int.interfaceId === cropSource.cropIdObj.sourceId)

					if (mainSource === undefined) {
						self.log(
							'error',
							`mainSource not found for cropSource.cropIdObj.sourceId: ${cropSource.cropIdObj.sourceId}`,
						)
						return
					}

					await self.apiClient?.setCropSourceOnLayer(layer, cropSource, mainSource)
				}
			},
		},
		switchSourceBackup: {
			name: 'Switch Input Backup',
			description:
				'Manual switch of input backup when enable=1. Skips PUT when disabled, or when switchMode=0 (auto) and either primary/backup source is offline.',
			options: [
				{
					type: 'dropdown',
					id: 'backupSourceId',
					label: 'Input Backup',
					default: '',
					choices: (self.sourceBackups.sourceBackup.backup ?? []).map((backup) => {
						const interfaceLookup = buildInterfaceLookup(self.getInterfaces(2, 0))

						const primaryLabel = interfaceLookup[backup.primarySourceId] ?? backup.primarySourceId
						const backupLabel = interfaceLookup[backup.backupSourceId] ?? backup.backupSourceId

						return {
							id: backup.id,
							label: `P: ${primaryLabel} - B: ${backupLabel}`,
						}
					}),
				},
			],
			callback: async (event) => {
				const selectedId = Number(event.options.backupSourceId)

				const currentSourceBackup = self.sourceBackups.sourceBackup
				if (!currentSourceBackup || !currentSourceBackup.backup) return

				const entry = currentSourceBackup.backup.find((b) => b.id === selectedId)
				if (!entry) return

				if (currentSourceBackup.enable !== 1) {
					self.log('info', 'switchSourceBackup: input backup disabled (enable=0); skipping device PUT')
					return
				}

				if (entry.switchMode === 0 && backupEntryHasOfflineSource(self, entry)) {
					self.log(
						'info',
						`switchSourceBackup: backup id ${selectedId} auto switch (switchMode=0) with offline source; skipping device PUT`,
					)
					return
				}

				try {
					const newBackupSource: SourceBackup = {
						sourceBackup: {
							...currentSourceBackup,
							backup: currentSourceBackup.backup.map((backup) => {
								if (backup.id !== selectedId) {
									return backup
								}

								const usingPrimary =
									backup.usingSourceId === backup.primarySourceId && backup.usingSourceType === backup.primarySourceType

								return {
									...backup,
									primaryFirst: 0,
									usingSourceId: usingPrimary ? backup.backupSourceId : backup.primarySourceId,
									usingSourceType: usingPrimary ? backup.backupSourceType : backup.primarySourceType,
								}
							}),
						},
					}

					self.log('debug', `Setting new backup source: ${JSON.stringify(newBackupSource)}`)
					await self.apiClient?.setBackupSource(newBackupSource)
					self.sourceBackups = newBackupSource
					self.updateVariableValues()
				} catch (error: any) {
					self.log('error', 'switchSourceBackup send error')
					self.log('error', error)
				}
			},
		},
		setTestPattern: {
			name: 'Set Test Pattern on Screen',
			description: 'Set a test pattern on the selected screen',
			options: [
				{
					type: 'dropdown',
					id: 'screenId',
					label: 'Screen',
					default: self.screens.filter((screen) => {
						return [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX].includes(screen.screenIdObj.type)
					})[0]?.screenId,
					choices: self.screens
						.filter((screen) => {
							return [SCREEN_TYPE.SCREEN, SCREEN_TYPE.AUX].includes(screen.screenIdObj.type)
						})
						.map(
							(screen): DropdownChoice => ({
								id: screen.screenId,
								label: screen.general.name,
							}),
						),
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
					id: 'testType',
					label: 'Test Type',
					default: 'interface',
					choices: [
						{ id: 'interface', label: 'Connector Test' },
						{ id: 'screen', label: 'Screen Test' },
					],
					isVisibleExpression: '$(options:enable) == 1',
				},
				{
					type: 'dropdown',
					id: 'patternType',
					label: 'Test Pattern',
					default: TEST_PATTERN_TYPE_CHOICES[0].value,
					choices: TEST_PATTERN_TYPE_CHOICES.map((choice) => ({
						id: choice.value,
						label: choice.label,
					})),
					isVisibleExpression: "$(options:enable) == 1 && $(options:testType) == 'interface'",
				},
				{
					type: 'dropdown',
					id: 'screenPatternType',
					label: 'Test Pattern',
					default: SCREEN_TEST_PATTERN_TYPE_CHOICES[0].value,
					choices: SCREEN_TEST_PATTERN_TYPE_CHOICES.map((choice) => ({
						id: choice.value,
						label: choice.label,
					})),
					isVisibleExpression: "$(options:enable) == 1 && $(options:testType) == 'screen'",
				},
				{
					type: 'dropdown',
					id: 'bright',
					label: 'Grayscale',
					default: 3,
					choices: [
						{ id: 1, label: '25' },
						{ id: 2, label: '50' },
						{ id: 3, label: '75' },
						{ id: 4, label: '100' },
					],
					isVisibleExpression: '$(options:enable) == 1',
				},
				{
					type: 'dropdown',
					id: 'spacingLevel',
					label: 'Spacing Level',
					default: 5,
					choices: [
						{ id: 1, label: '1' },
						{ id: 2, label: '2' },
						{ id: 3, label: '3' },
						{ id: 4, label: '4' },
						{ id: 5, label: '5' },
						{ id: 6, label: '6' },
						{ id: 7, label: '7' },
						{ id: 8, label: '8' },
					],
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "interface" && ($(options:patternType) == 5 || $(options:patternType) == 6 ||$(options:patternType) == 7 || $(options:patternType) == 9 || $(options:patternType) == 256 || $(options:patternType) == 257 || $(options:patternType) == 258 || $(options:patternType) == 259 || $(options:patternType) == 260 || $(options:patternType) == 261 || $(options:patternType) == 262 || $(options:patternType) == 263)',
				},
				{
					type: 'number',
					id: 'gridLineWidth',
					label: 'Grid Width',
					default: 1,
					min: 1,
					max: 64,
					required: false,
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "interface" && ($(options:patternType) == 512 || $(options:patternType) == 513 || $(options:patternType) == 514 || $(options:patternType) == 515 || $(options:patternType) == 516 || $(options:patternType) == 517 || $(options:patternType) == 518 || $(options:patternType) == 519 || $(options:patternType) == 521)',
				},
				{
					type: 'dropdown',
					id: 'speed',
					label: 'Speed',
					// Default value: 4 (Extremely Fast)
					default: SPEED_LEVEL_CHOICES[4].value,
					choices: SPEED_LEVEL_CHOICES.map((choice) => ({
						id: choice.value,
						label: choice.label, // Display numeric value (0-4)
					})),
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "interface" && ($(options:patternType) == 512 || $(options:patternType) == 513 || $(options:patternType) == 514 || $(options:patternType) == 515 || $(options:patternType) == 516 || $(options:patternType) == 517 || $(options:patternType) == 518)',
				},
				{
					type: 'number',
					id: 'verticalSpace',
					label: 'Vertical Space',
					default: 32,
					min: 1,
					max: 32767,
					step: 1,
					required: false,
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "interface" && ($(options:patternType) == 512 || $(options:patternType) == 516 || $(options:patternType) == 518 || $(options:patternType) == 519 || $(options:patternType) == 521)',
				},
				{
					type: 'number',
					id: 'horizontalSpace',
					label: 'Horizontal Space',
					default: 32,
					min: 1,
					max: 32767,
					step: 1,
					required: false,
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "interface" && ($(options:patternType) == 513 || $(options:patternType) == 514 || $(options:patternType) == 515 || $(options:patternType) == 516 || $(options:patternType) == 517 || $(options:patternType) == 518 || $(options:patternType) == 519 || $(options:patternType) == 521)',
				},
				// {
				// 	type: 'checkbox',
				// 	id: 'screenBorder',
				// 	label: 'Screen Border',
				// 	default: false,
				// 	isVisibleExpression: '$(options:enable) == 1',
				// },
				// {
				// 	type: 'checkbox',
				// 	id: 'interfaceBorder',
				// 	label: 'Interface Border',
				// 	default: false,
				// 	isVisibleExpression: '$(options:enable) == 1',
				// },
				{
					type: 'dropdown',
					id: 'position',
					label: 'Position',
					default: 3,
					choices: [
						{ id: 1, label: 'Top Left' },
						{ id: 2, label: 'Top Right' },
						{ id: 3, label: 'Center' },
						{ id: 4, label: 'Bottom Left' },
						{ id: 5, label: 'Bottom Right' },
					],
					isVisibleExpression:
						'$(options:enable) == 1 && $(options:testType) == "screen" && ($(options:screenPatternType) == 519 || $(options:screenPatternType) == 521)',
				},
			],
			callback: async (event, context) => {
				try {
					const screen = self.screens.find((s) => s.screenId === event.options.screenId)
					if (!screen) return

					const enable = Number(event.options.enable) as 0 | 1
					const testType = event.options.testType as 'interface' | 'screen'
					const patternType = Number(
						testType === 'screen' ? event.options.screenPatternType : event.options.patternType,
					) as TestPatternValue

					const bright = parseInt(await context.parseVariablesInString(String(event.options.bright ?? '100')))

					const isSpacingLevelVisible =
						enable === 1 &&
						testType === 'interface' &&
						[5, 6, 7, 9, 256, 257, 258, 259, 260, 261, 262, 263].includes(patternType)
					const gridType: TestPatternGridType = isSpacingLevelVisible
						? TestPatternGridType.Density
						: TestPatternGridType.Spacing
					const gridLineWidth = Number(event.options.gridLineWidth ?? 1)
					// Parse speed level (0-4: Still/Slow/Medium/Fast/Extremely Fast)
					const speed = parseInt(
						await context.parseVariablesInString(String(event.options.speed) || String(SPEED_LEVEL_CHOICES[0].value)),
					)
					const verticalSpaceRaw = event.options.verticalSpace
					const verticalSpaceNum =
						verticalSpaceRaw !== undefined && verticalSpaceRaw !== null ? Number(verticalSpaceRaw) : Number.NaN
					const verticalSpace = !Number.isNaN(verticalSpaceNum) && verticalSpaceNum >= 1 ? verticalSpaceNum : 32

					const horizontalSpaceRaw = event.options.horizontalSpace
					const horizontalSpaceNum =
						horizontalSpaceRaw !== undefined && horizontalSpaceRaw !== null ? Number(horizontalSpaceRaw) : Number.NaN
					const horizontalSpace = !Number.isNaN(horizontalSpaceNum) && horizontalSpaceNum >= 1 ? horizontalSpaceNum : 32

					// TODO: Get screen resolution dynamically based on selected screen
					// For now, using a large default max value (32767) to allow any reasonable resolution
					// verticalSpace max should be: screen horizontal resolution / 4
					// horizontalSpace max should be: screen vertical resolution / 4
					// Example: For 1920x1080 screen, verticalSpace max = 1920/4 = 480, horizontalSpace max = 1080/4 = 270
					const screenHorizontalResolution = 32767 // TODO: Get from screen object
					const screenVerticalResolution = 32767 // TODO: Get from screen object
					const verticalSpaceMax = Math.floor(screenHorizontalResolution / 4)
					const horizontalSpaceMax = Math.floor(screenVerticalResolution / 4)

					// Validate and clamp values
					const validatedVerticalSpace = Math.max(1, Math.min(verticalSpace, verticalSpaceMax))
					const validatedHorizontalSpace = Math.max(1, Math.min(horizontalSpace, horizontalSpaceMax))

					if (verticalSpace !== validatedVerticalSpace) {
						self.log(
							'warn',
							`verticalSpace value ${verticalSpace} clamped to ${validatedVerticalSpace} (max: ${verticalSpaceMax} based on screen resolution)`,
						)
					}
					if (horizontalSpace !== validatedHorizontalSpace) {
						self.log(
							'warn',
							`horizontalSpace value ${horizontalSpace} clamped to ${validatedHorizontalSpace} (max: ${horizontalSpaceMax} based on screen resolution)`,
						)
					}

					// Convert checkbox boolean to number (true -> 1, false -> 0)
					const screenBorder = event.options.screenBorder ? 1 : 0
					const interfaceBorder = event.options.interfaceBorder ? 1 : 0
					const position = Number(event.options.position ?? 3)

					const grid = isSpacingLevelVisible ? Number(event.options.spacingLevel ?? 5) : horizontalSpace

					const payload: TestPatternPayload = {
						enable: enable,
						type: patternType,
						bright: isNaN(bright) ? 100 : Math.max(0, Math.min(100, bright)),
						gridType: gridType,
						gridLineWidth: gridLineWidth,
						speed: isNaN(speed) ? SPEED_LEVEL_CHOICES[0].value : speed,
						verticalGrid: verticalSpace,
						verticalSpace: verticalSpace,
						grid: grid,
						horizontalSpace: horizontalSpace,
						screenBorder: screenBorder,
						interfaceBorder: interfaceBorder,
						position: position,
					}

					if (enable === 0) {
						self.log('info', `Disabling test pattern on screen ${screen.screenId}`)
					}

					self.log(
						'info',
						`Setting test pattern: ${JSON.stringify({ screenId: screen.screenId, testPattern: payload })}`,
					)
					await self.apiClient?.setTestPatternOnScreen(screen, payload)

					self.checkFeedbacks('screenTestPatternState')
				} catch (error: any) {
					self.log('error', `Failed to set test pattern: ${error.message}`)
					self.log('error', `Error details: ${JSON.stringify(error)}`)
				}
			},
		},
	})
}
