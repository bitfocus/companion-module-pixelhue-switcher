import { combineRgb } from '@companion-module/base'
import { DEVICE_PRESETS } from '../utils/constant.js'

let presetNum = 128

const basicPresets = {
  take: {
    type: 'button',
    category: 'Basics',
    name: 'TAKE',
    style: {
      text: 'TAKE',
      size: '24',
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
      },
    ],
    feedbacks: [],
  },
  cut: {
    type: 'button',
    category: 'Basics',
    name: 'CUT',
    style: {
      text: 'CUT',
      size: '24',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(255, 0, 0),
    },
    steps: [
      {
        down: [
          {
            actionId: 'cut',
            options: {},
          },
        ],
      },
    ],
    feedbacks: [],
  },
}

const displayPresets = {
  ftb: {
    type: 'button',
    category: 'Display',
    name: 'FTB',
    style: {
      text: 'FTB',
      size: '18',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    steps: [
      {
        down: [
          {
            actionId: 'ftb',
            options: {
              ftb: '1',
            },
          },
        ],
      },
      {
        down: [
          {
            actionId: 'ftb',
            options: {
              ftb: '0',
            },
          },
        ],
      },
    ],
    feedbacks: [
      {
        feedbackId: 'ftb',
        style: {
          bgcolor: combineRgb(255, 0, 0),
        },
        options: {}
      }
    ],
  },

  freeze: {
    type: 'button',
    category: 'Display',
    name: 'Freeze',
    style: {
      text: 'Freeze',
      size: '18',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    steps: [
      {
        down: [
          {
            actionId: 'freeze',
            options: {
              freeze: '1',
            },
          },
        ],
      },
      {
        down: [
          {
            actionId: 'freeze',
            options: {
              freeze: '0',
            },
          },
        ],
      },
    ],
    feedbacks: [
      {
        feedbackId: 'freeze',
        style: {
          bgcolor: combineRgb(255, 0, 0),
        },
        options: {}
      }
    ],
  },


  // presetType: 2: PGM, 4: PVW (http)
  // presetType: 1: PGM, 0: PVW (cmd)
  presetType: {
    type: 'button',
    category: 'Display',
    name: 'presetType',
    style: {
      text: 'Load to \nPVW',
      size: '18',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
    },
    steps: [
      {
        down: [
          {
            actionId: 'presetType',
            options: {
              presetType: 'pgm',
            },
          },
        ],
      },
      {
        down: [
          {
            actionId: 'presetType',
            options: {
              presetType: 'pvw',
            },
          },
        ],
      },
    ],
    feedbacks: [
      {
        feedbackId: 'pgm',
        style: {
          bgcolor: combineRgb(255, 0, 0),
          text: 'Load to \nPGM',
        },
        options: {}
      }
    ],
  },
}

const customPlayPresets = {
  'preset-play': {
    type: 'button',
    category: 'Presets',
    name: 'Preset',
    style: {
      text: 'Preset',
      size: '18',
      color: combineRgb(0, 0, 0),
      bgcolor: combineRgb(255, 0, 255),
    },
    steps: [
      {
        down: [
          {
            actionId: 'preset',
            options: {
              preset: 0,
            },
          },
        ],
      },
    ],
    feedbacks: [],
  },
}

const getPresets = (num) => {
  const playPresets = {}
  for (let i = 1; i <= num; i++) {
    const preset = {
      type: 'button',
      category: 'Presets',
      name: 'Preset ' + i,
      style: {
        text: 'Preset \n' + i,
        size: '18',
        color: combineRgb(0, 0, 0),
        bgcolor: combineRgb(0, 255, 0),
      },
      steps: [
        {
          down: [
            {
              actionId: 'preset',
              options: {
                preset: i,
              },
            },
          ],
        },
      ],
      feedbacks: [],
    }
    playPresets['preset-play' + i] = preset
  }
  return playPresets
}

export const getPresetDefinitions = function (instance) {

  instance.log('info', 'preset-instance-config:')
  instance.log('info', JSON.stringify(instance.config))

  presetNum = parseInt(DEVICE_PRESETS[instance.config.modelId]) ?? 128
  const playPresets = getPresets(presetNum)

  return {
    ...basicPresets,
    ...displayPresets,
    ...customPlayPresets,
    ...playPresets,
  }
}
