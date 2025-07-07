import got from 'got'
import { combineRgb } from '@companion-module/base'
import { HTTP_DEVICES } from '../utils/constant.js'

export const getPresetFormatData = (list, instance) => {

	instance.log('debug', 'Get and parse Preset data')

	const modelId = instance.config.modelId
	const isHttpDevice = HTTP_DEVICES.includes(modelId)

	const playPresets = {}
	const playPgmPresets = {}
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
				bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'presetPgm',
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
		playPresets['preset-play-pgm' + item.presetId] = pgmPreset

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
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'presetPgm',
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
		playPresets['preset-play-pvw' + item.presetId] = pvwPreset

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
