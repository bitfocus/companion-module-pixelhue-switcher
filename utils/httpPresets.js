import got from 'got'
import { combineRgb } from '@companion-module/base'
import { HTTP_DEVICES } from '../utils/constant.js'

export const getPresetFormatData = (list, instance) => {

	instance.log('debug', 'Get and parse Preset data')

	const modelId = instance.config.modelId

	const playPresets = {}

	playPresets['label-1'] = {
      category: `Presets`,
      name: 'Standard',
      type: 'text',
      text: 'This loads the preset with standard picelhue companion code',
    }
	
	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]

		const preset = {
			type: 'button',
			category: 'Presets',
			name: item.general.name,
			presetId: item.presetId,
			sceneType: item.presetIdObj.sceneType,
			i: i,
			style: {
				text: item.general.name,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'preset',
							options: {
								presetId: item.presetId,
								sceneType: item.presetIdObj.sceneType,
								playType: item.presetIdObj.playType,
								preset: i,
							},
						},
					],
				},
			],
			feedbacks: [],
		}
		playPresets['preset-play' + item.presetId] = preset
	}

	playPresets['label-2'] = {
      category: `Presets`,
      name: 'PVW',
      type: 'text',
      text: 'Load the preset to the Preview',
    };

	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]

		const pvwPreset = {
			type: 'button',
			category: 'Presets',
			name: item.general.name,
			presetId: item.presetId,
			sceneType: item.presetIdObj.sceneType,
			i: i,
			style: {
				text: item.general.name,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'preset_load_in',
							options: {
								loadIn: 4,
								presetId: item.presetId,
								sceneType: item.presetIdObj.sceneType,
								playType: item.presetIdObj.playType,
								preset: i,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
					options: {
						state: 'preview',
						presetId: item.presetId,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
					options: {
						state: 'program',
						presetId: item.presetId,
					},
				},
			],
		}
		playPresets['preset-play-in-pvw' + item.presetId] = pvwPreset

	}

	playPresets['label-3'] = {
      category: `Presets`,
      name: 'PGM',
      type: 'text',
      text: 'Load the preset directly to the program',
    }

	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]

		const pgmPreset = {
			type: 'button',
			category: 'Presets',
			name: item.general.name,
			presetId: item.presetId,
			sceneType: item.presetIdObj.sceneType,
			i: i,
			style: {
				text: item.general.name,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'preset_load_in',
							options: {
								loadIn:2,
								presetId: item.presetId,
								sceneType: item.presetIdObj.sceneType,
								playType: item.presetIdObj.playType,
								preset: i,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
					options: {
						state: 'preview',
						presetId: item.presetId,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
					options: {
						state: 'program',
						presetId: item.presetId,
					},
				},
			],
		}
		playPresets['preset-play-in-pgm' + item.presetId] = pgmPreset
	}
	
	return playPresets;
}

export const getDevicePresets = async (url, token, event) => {
	const res = await got
		.get(`${url}/v1/preset/list-detail`, {
			headers: {
				Authorization: token,
				ip: event.config?.UCenterFlag?.ip,
				port: event.config?.UCenterFlag?.port,
				protocol: event.config?.UCenterFlag?.protocol,
			},
			https: {
				rejectUnauthorized: false,
			},
		})
		.json()

	return res
}
