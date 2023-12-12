import { combineRgb } from '@companion-module/base'

export const getFeedbacks = (instance) => {
  let feedbacks = {};

  feedbacks['ftb'] = {
    type: 'boolean',
    name: 'FTB Status Detection',
    description: 'Change the style when FTB is pressed.',
    defaultStyle: {
      bgcolor: combineRgb(255, 0, 0),
    },
    options: [],
    callback: () => instance.config.ftb === '1'
  }

  feedbacks['freeze'] = {
    type: 'boolean',
    name: 'Freeze Status Detection',
    description: 'Change the style when Freeze is pressed.',
    defaultStyle: {
      bgcolor: combineRgb(255, 0, 0),
    },
    options: [],
    callback: () => instance.config.freeze === '1'
  }

  feedbacks['pgm'] = {
    type: 'boolean',
    name: 'PGM Status Detection',
    description: 'Change the style when Load preset to PGM.',
    defaultStyle: {
      bgcolor: combineRgb(255, 0, 0),
      text: 'Load to \nPGM',
    },
    options: [],
    callback: () => instance.config.presetType === 'pgm'
  }

  return feedbacks
}
