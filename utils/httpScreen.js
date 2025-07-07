import got from 'got'
import { combineRgb } from '@companion-module/base'

export const getScreenFormatData = (list, instance) => {
	const playPresets = {}
	instance.log('debug', 'Get and parse Screen data')
	instance.log('info', 'La La La 11') 
	instance.log('info', 'screenSelect: ' + JSON.stringify(instance.screenSelect))
	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]
		const screen = {
			type: 'button',
			category: 'Screens',
			name: item.general.name,
			screenId: item.screenId,
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
							actionId: 'screen',
							options: {
								select: '0',
								screenId: item.screenId,
							},
						},
					],
				},
				{
					down: [
						{
							actionId: 'screen',
							options: {
								select: '1',
								screenId: item.screenId,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'screen',
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
					options: {
						screenId: item.screenId,
						type: item.screenIdObj.type,
						name: item.general.name,
					},
				},
			],
		}

		playPresets['screen-play' + item.screenId] = screen

		instance.screenSelect[item.screenId] = item.select
	}

	return playPresets
}

export const getScreenPresets = async (url, token, event) => {
	const res = await got
		.get(`${url}/v1/screen/list-detail`, {
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
