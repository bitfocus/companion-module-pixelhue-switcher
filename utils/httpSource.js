import got from 'got'
import { combineRgb } from '@companion-module/base'

export const getSourceFormatData = (list, instance) => {
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
								relationId: 0, // 与后端沟通，先默认为0
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

// sourceType : 源类型 【 0：空图层 1：无源； 2：输入类型；3：PGM；4：PVW； 5：BKG图片 6：LOGO图片  7：IPC类型8：截取源类型 9:   拼接源 10: ipc拼接屏11: 内置源;  12:内置图形源】

// 获取主的输入源
export const getSourceInput = async (url, token, instance) => {
	let obj = []
	instance.log('log', 'Input来了')
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
			// 工作模式【0：主模式，1：复制模式，2：禁用模式。】
			// 展示主模式下的输入源
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

// 获取屏幕的源
export const getSourceScreen = async (url, token, instance) => {
	let obj = []
	instance.log('log', 'Screen来了')
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
			// 屏幕类型：【0：空屏幕；2:普通屏幕;4:AUX屏幕;8:MVR屏幕；16:回显屏幕；32：led屏幕】
			// 只有普通屏幕能切源
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

// 获取图片的源
export const getSourcePicture = async (url, token, instance) => {
	let obj = []
	instance.log('log', '图片的源来了')
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
			// 图片类型 1：BKG 2:LOGO 3:OSD 4：时钟 5：内置源
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

// 获取截取的源
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
	instance.log('info', '来了')
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
