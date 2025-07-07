import got from 'got'
import { combineRgb } from '@companion-module/base'

export const getSourceFormatData = (list, instance) => {
	instance.log('debug', 'Get and parse Source data')

	const playPresets = {}
	for (let i = 1; i <= list.length; i++) {
		const item = list[i - 1]
		const screen = {
			type: 'button',
			category: 'Sources',
			name: item.name,
			sourceId: item.sourceId,
			style: {
				text: item.name,
				size: 'auto',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'source',
							options: {
								sourceId: item.sourceId,
								sourceType: item.sourceType,
								relationId: 0, // Communicate with the backend, default to 0
							},
						},
					],
				},
			],
			feedbacks: [],
		}

		playPresets['source-play' + item.sourceId] = screen
	}

	return playPresets
}

// sourceType: source type [0: empty layer 1: no source; 2: input type; 3: PGM; 4: PVW; 5: BKG image 6: LOGO image 7: IPC type 8: intercept source type 9: splicing source 10: ipc splicing screen 11: built-in source; 12: built-in graphics source]

// Get the main input source
export const getSourceInput = async (url, token, instance) => {
	let obj = []
	instance.log('log', 'Input is coming')
	try {
		const res = await got
			.get(`${url}/v1/interface/list-thumb`, {
				headers: {
					Authorization: token,
					ip: instance.config?.UCenterFlag?.ip,
					port: instance.config?.UCenterFlag?.port,
					protocol: instance.config?.UCenterFlag?.protocol,
				},
				https: {
					rejectUnauthorized: false,
				},
			})
			.json()

		if (res.code === 0) {
			// Working mode [0: master mode, 1: copy mode, 2: disable mode. ]
			// Display input source in master mode
			const list = (res.data.list ?? []).filter(
				(item) =>
					item?.auxiliaryInfo?.connectorInfo?.interfaceType === 2 && item?.auxiliaryInfo?.connectorInfo?.workMode == 0,
			)
			obj = list.map((item) => {
				return {
					...item,
					sourceId: 2 + '-' + item.interfaceId,
					sourceType: 2, //
					name: item.general.name,
				}
			})
		}
	} catch (e) {}
	return obj
}

// Get the source of the screen
export const getSourceScreen = async (url, token, instance) => {
	let obj = []
	instance.log('log', 'Screen is coming')
	try {
		const res = await got
			.get(`${url}/v1/screen/list-detail`, {
				headers: {
					Authorization: token,
					ip: instance.config?.UCenterFlag?.ip,
					port: instance.config?.UCenterFlag?.port,
					protocol: instance.config?.UCenterFlag?.protocol,
				},
				https: {
					rejectUnauthorized: false,
				},
			})
			.json()

		if (res.code === 0) {
			// Screen type: [0: empty screen; 2: normal screen; 4: AUX screen; 8: MVR screen; 16: echo screen; 32: LED screen]
			// Only normal screen can switch source
			const list = (res.data.list ?? []).filter((item) => item?.screenIdObj.type === 2)
			list.forEach((item) => {
				let pgm = {
					...item,
					sourceId: 3 + '-' + item.screenId,
					sourceType: 3, //
					name: item.general.name + '-PGM',
				}
				obj.push(pgm)
			})
		}
	} catch (e) {}
	return obj
}

// Get the source of the image
export const getSourcePicture = async (url, token, instance) => {
	let obj = []
	instance.log('log', 'The source of the picture is here')
	try {
		const res = await got
			.get(`${url}/v1/picture/list`, {
				headers: {
					Authorization: token,
					ip: instance.config?.UCenterFlag?.ip,
					port: instance.config?.UCenterFlag?.port,
					protocol: instance.config?.UCenterFlag?.protocol,
				},
				https: {
					rejectUnauthorized: false,
				},
			})
			.json()

		if (res.code === 0) {
			// Image type 1: BKG 2: LOGO 3: OSD 4: Clock 5: Built-in source
			obj = (res.data.list ?? []).map((item) => {
				return {
					...item,
					sourceId: item.pictureObj.type + '-' + item.pictureId + '-' + 'pic',
					sourceType: item.pictureObj.type, //
					name: item.general.name,
				}
			})
		}
	} catch (e) {}
	return obj
}

// Get the intercepted source
export const getSourceCrop = async (url, token, instance) => {
	let obj = []
	try {
		const res = await got
			.get(`${url}/v1/interface/crop-source`, {
				headers: {
					Authorization: token,
					ip: instance.config?.UCenterFlag?.ip,
					port: instance.config?.UCenterFlag?.port,
					protocol: instance.config?.UCenterFlag?.protocol,
				},
				https: {
					rejectUnauthorized: false,
				},
			})
			.json()

		if (res.code === 0) {
			obj = (res.data.list ?? []).map((item) => {
				return {
					...item,
					sourceId: 8 + '-' + item.cropId,
					sourceType: 8,
					name: item.name,
				}
			})
		}
	} catch (e) {}
	return obj
}

export const getSourcePresets = async (url, token, instance) => {
	instance.log('info', 'Here it comes!')
	const res = await Promise.all([
		getSourceInput(url, token, instance),
		getSourceScreen(url, token, instance),
		getSourcePicture(url, token, instance),
		getSourceCrop(url, token, instance),
	])

	let list = [...res[0], ...res[1], ...res[2], ...res[3]]

	return {
		code: 0,
		data: {
			list: list,
		},
	}
}
