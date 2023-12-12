import {
  DEVICE_PRESETS,
  COMMON_PRESET_TYPE,
  HTTP_DEVICES,
  HTTP_Protocol_FTB,
  Central_Control_Protocol_FTB,
  HTTP_Protocol_FREEZE,
  Central_Control_Protocol_FREEZE
} from '../utils/constant.js';
import { cmdActions } from '../utils/cmdActions.js';
import { httpActions } from '../utils/httpActions.js';

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

  actions['preset'] = {
    name: 'Select a preset to load',
    options: [
      {
        type: 'dropdown',
        name: 'Preset',
        id: 'preset',
        default: 1,
        choices: [
          ...Array(
            parseInt(DEVICE_PRESETS[instance.config.modelId]) ?? 128
          ),
        ].map((_, index) => ({
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

  return actions
}