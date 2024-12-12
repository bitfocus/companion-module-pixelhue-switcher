import got from 'got'
import { HTTP_PRESET_TYPE } from './constant.js'
import { handleReqWithToken, deal8273 } from './index.js'

async function getTakeReq(token) {
	const obj = {
		direction: 0,
		effectSelect: 0,
		switchEffect: {
			time: 500,
			type: 1,
		},
	}
	const res = await got.put(`${this.config.baseURL}/v1/screen/selected/take`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	return res
}

async function getCutReq(token, event, direction) {
	const obj = {
		direction: +direction || 0,
	}
	const res = await got.put(`${this.config.baseURL}/v1/screen/selected/cut`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	return res
}

async function getFTBReq(token, event) {
	this.config.ftb = event.options.ftb
	this.checkFeedbacks('ftb')
	const obj = {
		ftb: {
			enable: Number(event.options.ftb),
			time: 700,
		},
	}
	const res = await got.put(`${this.config.baseURL}/v1/screen/selected/ftb`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	return res
}

async function getFreezeReq(token, event) {
	this.config.freeze = event.options.freeze
	this.checkFeedbacks('freeze')
	const obj = {
		freeze: Number(event.options.freeze),
	}
	const res = await got.put(`${this.config.baseURL}/v1/screen/selected/freeze`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	return res
}

async function getPresetReq(token, event) {
	const obj = {
		sceneType: event.options.sceneType,
		presetId: event.options.presetId,
		//id: event.options.preset, // 场景创建的i not necessary anymore?
	}
	this.log('info', `getPresetReq-obj: ${JSON.stringify(obj)}`)
	const res = await got
		.put(`${this.config.baseURL}/v1/preset/play`, {
			headers: {
				Authorization: token,
				ip: this.config?.UCenterFlag?.ip,
				port: this.config?.UCenterFlag?.port,
				protocol: this.config?.UCenterFlag?.protocol,
			},
			https: {
				rejectUnauthorized: false,
			},
			json: obj,
		})
		.json()
	this.log('info', `The scene was set successfully - 场景设置成功了${JSON.stringify(res)}`)
	return res
}

async function getScreenReq(token, event) {
	this.log('info', event.options.select)
	this.log('info', JSON.stringify(this.screenSelect))

	const obj = [
		{
			screenId: Number(event.options.screenId),
			select: Number(event.options.select),
		},
	]
	const res = await got
		.put(`${this.config.baseURL}/v1/screen/select`, {
			headers: {
				Authorization: token,
				ip: this.config?.UCenterFlag?.ip,
				port: this.config?.UCenterFlag?.port,
				protocol: this.config?.UCenterFlag?.protocol,
			},
			https: {
				rejectUnauthorized: false,
			},
			json: obj,
		})
		.json()

	this.log('info', 22222)
	this.log('info', JSON.stringify(res))

	if (res.code === 0 && this.screenSelect[event.options.screenId] !== event.options.select) {
		this.screenSelect[event.options.screenId] = Number(event.options.select)
		this.checkFeedbacks('screen')
	}

	this.log('info', `屏幕设置成功了${JSON.stringify(res)}`)
	return res
}

// 选中图层
async function getLayerReq(token, event) {
	// for (let key in this.layerSelect) {
	// 	this.layerSelect[key] = false
	// }
	// this.layerSelect[event.options.layerId] = this.layerSelect[event.options.layerId] === 1 ? 0 : 1
	// this.checkFeedbacks('layer')
	// const obj = [
	// 	{
	// 		layerId: event.options.layerId,
	// 		selected: this.layerSelect[event.options.layerId] === 1 ? 0 : 1,
	// 	},
	// ]
	// const res = await got
	// 	.put(`${this.config.baseURL}/v1/layers/select`, {
	// 		headers: {
	// 			Authorization: token,
	// 			ip: this.config?.UCenterFlag?.ip,
	// 			port: this.config?.UCenterFlag?.port,
	// 			protocol: this.config?.UCenterFlag?.protocol,
	// 		},
	// 		https: {
	// 			rejectUnauthorized: false,
	// 		},
	// 		json: obj,
	// 	})
	// 	.json()
	// this.layerSelect[event.options.layerId] = this.layerSelect[event.options.layerId] === 1 ? 0 : 1
	// this.checkFeedbacks('layer')
	// return res
}

async function getLayersSourceReq(token, event) {
	let layerId = -1
	for (let key in this.layerSelect) {
		if (this.layerSelect[key] === 1) {
			layerId = key
		}
	}

	this.log('info', layerId)
	if (layerId === -1) return

	const obj = [
		{
			layerId: Number(layerId),
			source: {
				general: {
					sourceId: event.options.sourceId,
					sourceType: event.options.sourceType,
					relationId: 0,
				},
			},
		},
	]

	this.log('info', JSON.stringify(obj))
	const res = await got
		.put(`${this.config.baseURL}/v1/layers/source`, {
			headers: {
				Authorization: token,
				ip: this.config?.UCenterFlag?.ip,
				port: this.config?.UCenterFlag?.port,
				protocol: this.config?.UCenterFlag?.protocol,
			},
			https: {
				rejectUnauthorized: false,
			},
			json: obj,
		})
		.json()

	this.log('info', `切源成功了${JSON.stringify(res)}`)

	return res
}

async function setSwapCopyReq(token, event) {
	this.config.swapCopy = event.options.swapCopy
	this.checkFeedbacks('swapCopy')
	const obj = {
		enable: +event.options.swapCopy,
	}
	this.log('info', `setSwapCopyReq: ${JSON.stringify(obj)}}`)
	const res = await got.put(`${this.config.baseURL}/v1/screen/global/swap`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	this.log('info', `${res.body}`)
	return res
}

let takeTimeTimer = null
async function takeTimeReq(token, event) {
	this.log('info', `takeTime_direction: ${event.options.direction}`)
	const direction = event.options.direction
	if (this.config.globalSwitchEffect?.time) {
		if (direction === 'left') {
			const time = +this.config.globalSwitchEffect.time - 100
			this.config.globalSwitchEffect.time = time >= 100 ? time : 100
		} else if (direction === 'right') {
			const time = +this.config.globalSwitchEffect.time + 100
			this.config.globalSwitchEffect.time = time <= 10000 ? time : 10000
		}
		const obj = {
			switchEffect: {
				time: this.config.globalSwitchEffect.time,
				type: 1,
			},
		}
		clearTimeout(takeTimeTimer)
		takeTimeTimer = setTimeout(async () => {
			this.log('info', `takeTimeReq: ${JSON.stringify(obj)}}`)
			const res = await got.put(`${this.config.baseURL}/v1/screen/global/switch-effect`, {
				headers: {
					Authorization: token,
					ip: this.config?.UCenterFlag?.ip,
					port: this.config?.UCenterFlag?.port,
					protocol: this.config?.UCenterFlag?.protocol,
				},
				https: {
					rejectUnauthorized: false,
				},
				json: obj,
			})
			this.log('info', `${res.body}`)
			deal8273.bind(this)(res, takeTimeReq, [event])
		}, 300)
	}
}

async function setMappingReq(token, event) {
	this.config.mapping = event.options.mapping
	this.checkFeedbacks('mapping')
	const obj = {
		nodeId: 1,
		enable: +event.options.mapping,
	}
	this.log('info', `setMappingReq: ${JSON.stringify(obj)}}`)
	const res = await got.put(`${this.config.baseURL}/v1/node/interface-location`, {
		headers: {
			Authorization: token,
			ip: this.config?.UCenterFlag?.ip,
			port: this.config?.UCenterFlag?.port,
			protocol: this.config?.UCenterFlag?.protocol,
		},
		https: {
			rejectUnauthorized: false,
		},
		json: obj,
	})
	this.log('info', `${res.body}`)
	return res
}

function handleHttpPresetType(event) {
	this.config.presetType = event.options.presetType
	this.checkFeedbacks('pgm')
}

function handleHttpTake(event) {
	handleReqWithToken.bind(this)(getTakeReq, event)
}

function handleHttpCut(event, direction) {
	handleReqWithToken.bind(this)(getCutReq, event, direction)
}

function handleHttpFTB(event) {
	handleReqWithToken.bind(this)(getFTBReq, event)
}

function handleHttpFreeze(event) {
	handleReqWithToken.bind(this)(getFreezeReq, event)
}

function handleHttpPreset(event) {
	handleReqWithToken.bind(this)(getPresetReq, event)
}

function handleHttpScreen(event) {
	handleReqWithToken.bind(this)(getScreenReq, event)
}

function handleHttpLayer(event) {
	for (let key in this.layerSelect) {
		if (key != event.options.layerId) {
			this.layerSelect[key] = 0
		}
	}

	this.layerSelect[event.options.layerId] = Number(event.options.selected)

	this.log('info', JSON.stringify(this.layerSelect))
	this.checkFeedbacks('layer')
}

function handleHttpSource(event) {
	handleReqWithToken.bind(this)(getLayersSourceReq, event)
}

function handleHttpSwapCopy(event) {
	handleReqWithToken.bind(this)(setSwapCopyReq, event)
}

function handleHttpTakeTime(event) {
	handleReqWithToken.bind(this)(takeTimeReq, event)
}
function handleHttpMapping(event) {
	handleReqWithToken.bind(this)(setMappingReq, event)
}

export const httpActions = {
	take: handleHttpTake,
	cut: handleHttpCut,
	ftb: handleHttpFTB,
	freeze: handleHttpFreeze,
	presetType: handleHttpPresetType,
	preset: handleHttpPreset,
	screen: handleHttpScreen,
	layer: handleHttpLayer,
	source: handleHttpSource,
	swapCopy: handleHttpSwapCopy,
	matchPgm: handleHttpCut,
	takeTime: handleHttpTakeTime,
	mapping: handleHttpMapping,
}
