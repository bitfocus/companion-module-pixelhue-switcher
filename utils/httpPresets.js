import got from 'got'
import { combineRgb } from '@companion-module/base'

export const getPresetFormatData = (list) => {
	const playPresets = {}
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
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
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
	return playPresets
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
