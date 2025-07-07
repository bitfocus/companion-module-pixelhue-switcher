import {
	COMMON_PRESET_TYPE,
	HTTP_DEVICES,
	HTTP_Protocol_FTB,
	Central_Control_Protocol_FTB,
	HTTP_Protocol_FREEZE,
	Central_Control_Protocol_FREEZE,
	HTTP_Protocol_Swap_Copy,
	HTTP_Protocol_Output_Switch,
	CMD_DEVICES,
	DEVICE_PRESETS,
} from '../utils/constant.js'
import { cmdActions } from '../utils/cmdActions.js'
import { httpActions } from '../utils/httpActions.js'
import { isHttpDeviceWithDQ } from '../utils/index.js'

export const getActions = (instance) => {
	const modelId = instance.config.modelId
	const isHttpDevice = HTTP_DEVICES.includes(modelId)
	const actionsObj = isHttpDevice ? httpActions : cmdActions

	let actions = {}

	actions['take'] = {
		name: 'TAKE',
		options: [],
		callback: async (event) => {
			try {
				actionsObj['take'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'take send error')
			}
		},
	}

	actions['cut'] = {
		name: 'CUT',
		options: [],
		callback: async (event) => {
			try {
				actionsObj['cut'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'cut send error')
			}
		},
	}

	actions['ftb'] = {
		name: 'Make the screen fade to black or return to normal',
		options: [
			{
				type: 'dropdown',
				name: 'FTB',
				id: 'ftb',
				default: '1',
				choices: isHttpDevice ? HTTP_Protocol_FTB : Central_Control_Protocol_FTB,
			},
		],
		callback: async (event) => {
			try {
				actionsObj['ftb'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'FTB send error')
			}
		},
	}

	actions['freeze'] = {
		name: 'Freeze/Unfreeze the screen',
		options: [
			{
				type: 'dropdown',
				name: 'FRZ',
				id: 'freeze',
				default: '1',
				choices: isHttpDevice ? HTTP_Protocol_FREEZE : Central_Control_Protocol_FREEZE,
			},
		],
		callback: async (event) => {
			try {
				actionsObj['freeze'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'FTB send error')
			}
		},
	}

	actions['presetType'] = {
		name: 'Choose a destination to load the preset',
		options: [
			{
				type: 'dropdown',
				name: 'PVW/PGM',
				id: 'presetType',
				default: 'pvw',
				choices: COMMON_PRESET_TYPE,
			},
		],
		callback: async (event) => {
			try {
				actionsObj['presetType'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'presetType set error')
			}
		},
	}

	if (CMD_DEVICES.includes(modelId)) {
		actions['preset'] = {
			name: 'Select a preset to load',
			options: [
				{
					type: 'dropdown',
					name: 'Preset',
					id: 'preset',
					default: 1,
					choices: [...Array(parseInt(DEVICE_PRESETS[modelId]) ?? 128)].map((_, index) => ({
						id: index + 1,
						label: `Preset ${index + 1}`,
					})),
				},
			],
			callback: async (event) => {
				try {
					actionsObj['preset'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}
	}
	if(isHttpDevice){
		actions['preset'] = {
			name: 'Select a preset to load',
			options: [
				{
					type: 'dropdown',
					name: 'Preset',
					id: 'presetId',
					default: 1,
					choices: Object.entries(instance.presetDefinitionPreset)
					.filter(([key, value]) => !key.includes('pgm') && !key.includes('pvw'))
					.map(([key, value]) => ({
						id: value.presetId,
						label: value.name,
					}))
				},
			],
			callback: async (event) => {
				try {
					let obj = instance.presetDefinitionPreset[`preset-play${event.options.presetId}`]

					if (!obj) return
					let data = {
						options: {
							presetId: obj.presetId,
							i: obj.i,
							sceneType: obj.sceneType,
						},
					}
					actionsObj['preset'].bind(instance)(data)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}


		actions['preset_load_in'] = {
			name: 'Select a preset to load in PGM/PVW',
			options: [
				{
					type: 'dropdown',
					label: 'Load in',
					id: 'loadIn',
					default: 4,
					choices: [{id: 2, label: 'Program'}, {id: 4, label: 'Preview'}],
				},
				{
					type: 'dropdown',
					name: 'Preset',
					id: 'presetId',
					default: 1,
					choices: Object.entries(instance.presetDefinitionPreset)
						.filter(([key, value]) => key.includes('pvw'))
						.map(([key, value]) => ({
							id: value.presetId,
							label: value.name,
						}))
				},
			],
			callback: async (event) => {
				try {
					let obj;
					if(event.options.loadIn == 2) {
						obj = instance.presetDefinitionPreset[`preset-play-in-pvw${event.options.presetId}`]
					}else{
						obj = instance.presetDefinitionPreset[`preset-play-in-pgm${event.options.presetId}`]
					}

					if (!obj) return
					let data = {
						options: {
							presetId: obj.presetId,
							i: obj.i,
							sceneType: event.options.loadIn,
						},
					}
					actionsObj['preset_load_in'].bind(instance)(data)
				} catch (error) {
					instance.log('error', 'load_preset_in send error' + error)
				}
			},
		}

		actions['toggleScreen'] = {
			name: 'Toggle Select a screen',
			options: [
				{
					type: 'dropdown',
					name: 'Screen',
					id: 'screenId',
					default: 1,
					choices: Object.values(instance.presetDefinitionScreen).map((item) => ({
						id: item.screenId,
						label: item.name,
					})),
				},
			],
			callback: async (event) => {
				const selected = instance.selectedScreens.includes(event.options.screenId)
				event.options.select = selected ? '0' : '1'
				instance.log('info', JSON.stringify(event))
				try {
					actionsObj['screen'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}

		actions['screen'] = {
			name: 'Select/Deselect a screen',
			options: [
				{
					type: 'dropdown',
					name: 'Screen',
					id: 'screenId',
					default: 1,
					choices: Object.values(instance.presetDefinitionScreen).map((item) => ({
						id: item.screenId,
						label: item.name,
					})),
				},
				{
					type: 'dropdown',
					name: 'ScreenSelect',
					id: 'select',
					default: '0',
					choices: [
						{ id: '0', label: 'Deselect the screen', default: '0' },
						{ id: '1', label: 'Select the screen', default: '1' },
					],
				},
			],
			callback: async (event) => {
				try {
					actionsObj['screen'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}

		actions['bring_to'] = {
			name: 'Bring selected to desired',
			options: [
				{
					type: 'dropdown',
					name: 'Bring to',
					id: 'bringId',
					default: 1,
					choices: [
						{ id: '1', label: 'Bring Farward', default: '1' },
						{ id: '2', label: 'Bring Backward', default: '2' },
						{ id: '3', label: 'Bring to Front', default: '3' },
						{ id: '4', label: 'Bring to Back', default: '4' },
					],
				},
			],
			callback: async (event) => {
				try {
					actionsObj['bring_to'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'bring_to send error')
				}
			},
		}
		actions['layer'] = {
			name: 'Select/Deselect a layer',
			options: [
				{
					type: 'dropdown',
					name: 'Layer',
					id: 'layerId',
					default: 1,
					choices: Object.values(instance.presetDefinitionLayer).map((item) => ({
						id: item.layerId,
						label: item.name,
					})),
				},
				{
					type: 'dropdown',
					name: 'ScreenSelect',
					id: 'selected',
					default: '0',
					choices: [
						{ id: '0', label: 'Deselect the layer', default: '0' },
						{ id: '1', label: 'Select the layer', default: '1' },
					],
				},
			],
			callback: async (event) => {
				try {
					actionsObj['layer'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}

		actions['source'] = {
			name: 'Change the source for the selected layer',
			options: [
				{
					type: 'dropdown',
					name: 'Source',
					id: 'sourceId',
					default: 1,
					choices: Object.values(instance.presetDefinitionSource).map((item) => ({
						id: item.sourceId.toString(),
						label: item.name,
					})),
				},
			],
			callback: async (event) => {
				try {
					let [sourceType, sourceId] = event.options.sourceId.split('-')
					let obj = {
						options: {
							sourceId: Number(sourceId),
							sourceType: Number(sourceType),
						},
					}
					actionsObj['source'].bind(instance)(obj)
				} catch (error) {
					instance.log('error', 'load_source send error')
				}
			},
		}

		actions['swapCopy'] = {
			name: 'Swap between PGM and PVM/Copy PVW to PGM',
			options: [
				{
					type: 'dropdown',
					name: 'SwapCopy',
					id: 'swapCopy',
					default: '1',
					choices: HTTP_Protocol_Swap_Copy,
				},
			],
			callback: async (event) => {
				try {
					actionsObj['swapCopy'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'SwapCopy send error')
				}
			},
		}

		actions['matchPgm'] = {
			name: 'Copy layers from PGM of the selected screen to PVW',
			options: [],
			callback: async (event) => {
				try {
					actionsObj['matchPgm'].bind(instance)(event, 1)
				} catch (error) {
					instance.log('error', 'MatchPGM send error')
				}
			},
		}

		actions['takeTimeRight'] = {
			name: 'Increase the transition duration of Take',
			options: [],
			callback: async (event) => {
				try {
					actionsObj['takeTime'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'Take Time+ send error')
				}
			},
		}

		actions['takeTimeLeft'] = {
			name: 'Decrease the transition duration of Take',
			options: [],
			callback: async (event) => {
				try {
					actionsObj['takeTime'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'Take Time- send error')
				}
			},
		}

		if (isHttpDeviceWithDQ(instance)) {
			actions['mapping'] = {
				name: 'Enable or disable output mapping.',
				options: [
					{
						type: 'dropdown',
						name: 'mapping',
						id: 'mapping',
						default: '0',
						choices: HTTP_Protocol_Output_Switch,
					},
				],
				callback: async (event) => {
					try {
						actionsObj['mapping'].bind(instance)(event)
					} catch (error) {
						instance.log('error', 'Mapping send error')
					}
				},
			}
		}
	} // End of if (isHttpDevice) block

	return actions
}
