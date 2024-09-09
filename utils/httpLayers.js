import got from 'got'
import { combineRgb } from '@companion-module/base'

export const getLayerFormatData = (list, screenList = [], instance) => {
	const playPresets = {}
	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]

		const screenName =
			screenList.find((screenItem) => screenItem.screenId === item.layerIdObj.attachScreenId)?.general?.name ?? ''
		const sceneType = item.layerIdObj.sceneType === 2 ? 'PGM' : item.layerIdObj.sceneType === 4 ? 'PVM' : ''
		const name = '' + screenName + '\n' + sceneType + '\n' + item.general.name

		const screen = {
			type: 'button',
			category: 'Layers',
			name: name,
			layerId: item.layerId,
			style: {
				text: name,
				size: 'auto',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'layer',
							options: {
								selected: '1',
								layerId: item.layerId,
								name: item.general.name,
							},
						},
					],
				},
				{
					down: [
						{
							actionId: 'layer',
							options: {
								selected: '0',
								layerId: item.layerId,
								name: item.general.name,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layer',
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
					options: {
						layerId: item.layerId,
						name: item.general.name,
					},
				},
			],
		}

		playPresets['layer-play' + item.layerId] = screen

		instance.layerSelect[item.layerId] = instance.layerSelect[item.layerId] === 1 ? 1 : 0
	}

	return playPresets
}

export const getLayerPresets = async (url, token, event) => {
	const res = await got
		.get(`${url}/v1/layers/list-detail`, {
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
