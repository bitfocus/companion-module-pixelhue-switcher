import {
	COMMON_PRESET_TYPE,
	HTTP_DEVICES,
	HTTP_Protocol_FTB,
	Central_Control_Protocol_FTB,
	HTTP_Protocol_FREEZE,
	Central_Control_Protocol_FREEZE,
	HTTP_Protocol_Swap_Copy,
	HTTP_Protocol_Output_Switch,
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

	actions['presetPvw'] = {
		name: 'Select a preset to load to PVW',
		options: [
			{
				type: 'dropdown',
				name: 'Preset',
				id: 'presetId',
				default: 1,
				choices: Object.values(instance.presetList).map((item) => ({
					id: item.presetId,
					label: item.general.name,
				})),
			},
		],
		callback: async (event) => {
			try {
				let data = {
					options: {
						presetId: event.options.presetId,
						//i: obj.i, why use that not necessary anymore?
						sceneType: isHttpDevice ? 4 : 0
					},
				}
				actionsObj['preset'].bind(instance)(data)
			} catch (error) {
				instance.log('error', 'load_preset send error')
			}
		},
	}

	actions['presetPgm'] = {
		name: 'Load a preset directly to PGM',
		options: [
			{
				type: 'dropdown',
				name: 'Preset',
				id: 'presetId',
				default: 1,
				choices: Object.values(instance.presetList).map((item) => ({
					id: item.presetId,
					label: item.general.name,
				})),
			},
		],
		callback: async (event) => {
			instance.log('info', JSON.stringify(event))
			try {
				let data = {
					options: {
						presetId: event.options.presetId,
						//i: obj.i, why use that not necessary anymore?
						sceneType: isHttpDevice ? 2 : 1,
					},
				}
				actionsObj['preset'].bind(instance)(data)
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

	if (isHttpDevice) {
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
	}

	return actions
}
