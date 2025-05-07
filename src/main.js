import { InstanceBase, InstanceStatus, TCPHelper, UDPHelper, Regex, runEntrypoint } from '@companion-module/base'
import ping from 'ping'

import { getActions } from './actions.js'
import { getPresetDefinitions } from './presets.js'
import { getFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'

import { HTTP_DEVICES, PROTOCOL_TYPE, CMD_DEVICES, DEVICES_INFORMATION, RETRY_COUNT } from '../utils/constant.js'
import {
	generateToken,
	getDeviceList,
	getOpenDetail,
	getSystemDeviceInfo,
	getToken,
	getSwitchEffect,
} from '../utils/index.js'
import { retry } from '../utils/retry.js'
import { getDevicePresets, getPresetFormatData } from '../utils/httpPresets.js'
import { getScreenPresets, getScreenFormatData } from '../utils/httpScreen.js'
import { getLayerPresets, getLayerFormatData } from '../utils/httpLayers.js'
import { getSourcePresets, getSourceFormatData } from '../utils/httpSource.js'

const LATCH_ACTIONS = ['ftb', 'freeze', 'presetType', 'swapCopy']
class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.PROTOCOL_TYPE = Object.values(PROTOCOL_TYPE)

		this.DEVICES_INFO = getSystemDeviceInfo()
		this.DEVICES = Object.values(this.DEVICES_INFO)

		this.screenSelect = {}
		this.layerSelect = {}
		this.presetList = {}
		this.presetDefinitionPreset = {}
		this.presetDefinitionScreen = {}
		this.presetDefinitionLayer = {}
		this.presetDefinitionSource = {}

		// Sort alphabetical
		this.DEVICES.sort(function (a, b) {
			var x = a.label.toLowerCase()
			var y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})
	}

	updateActions() {
		this.log('debug', 'update actions....')
		this.setActionDefinitions(getActions(this))
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	// Return config fields for web config
	getConfigFields() {
		this.log('getting the fields....')
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: DEVICES_INFORMATION,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				default: '192.168.0.10',
				regex: Regex.IP,
			},
			{
				type: 'dropdown',
				id: 'modelId',
				label: 'Model',
				width: 6,
				choices: this.DEVICES,
				default: this.DEVICES[0].id,
			},
			// {
			//   type: 'textinput',
			//   id: 'port',
			//   label: 'Port',
			//   width: 6,
			//   default: '8088',
			//   regex: Regex.PORT,
			// },
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 6,
				default: '',
				isVisibleData: { httpDevices: HTTP_DEVICES, config: this.config },
				isVisible: (options, dataInfo) =>
					dataInfo.httpDevices.includes(options.modelId) &&
					!!dataInfo.config.isOldVersion &&
					options.modelId === dataInfo.config.modelId,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				default: '',
				isVisibleData: { httpDevices: HTTP_DEVICES, config: this.config },
				isVisible: (options, dataInfo) =>
					dataInfo.httpDevices.includes(options.modelId) &&
					!!dataInfo.config.isOldVersion &&
					options.modelId === dataInfo.config.modelId,
			},
		]
	}

	// When module gets deleted
	async destroy() {
		this.log('info', 'destroy:' + this.id)
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
		if (this.udp !== undefined) {
			this.udp.destroy()
		}
		if (this.heartbeat) {
			clearInterval(this.heartbeat)
			delete this.heartbeat
		}
		// 删除心跳
		if (this.presetBeat) {
			clearInterval(this.presetBeat)
			delete this.presetBeat
		}
	}

	/** devices http handle start */

	async getDevicesByUCenter() {
		this.log('info', `getDevicesByUCenter-start...`)

		this.config.protocol = 'https'
		this.config.port = '19998'
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`

		try {
			const devicesRes = await getDeviceList(this.config.baseURL)

			if (devicesRes.code === 0) {
				const device = devicesRes.data?.list?.find((item) => item.ip === this.config.host)
				const deviceProtocol = device?.protocols?.[0]?.linkType ?? 'http'
				const protocol = ['http', 'https'].includes(deviceProtocol) ? deviceProtocol : 'http'
				this.log('info', `getDevicesByUCenter-protocol:${protocol}`)

				// 该信息需在server接口header中同步下发
				this.config.UCenterFlag = {
					protocol,
					ip: '127.0.0.1',
					port: device.SN.includes('virtual') ? device.protocols[0].port : '8088' //Changed here to work with Simulator via PixelFlow
				}
				await this.getDeviceStatusByOpenDetail()
				this.getGlobalSwitchEffect()
			}
		} catch (e) {
			this.log('error', `getDeviceByUCenter Error: ${e.toString()}`)
			await this.getProtocol()
		}
	}

	async getDeviceStatusByPWD() {
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`

		this.log('info', `getDeviceStatusByPWD-url:${this.config.baseURL} - ${ new Date().toString}`)
		this.log('info', `tokenInfo:${this.config.username}/${this.config.password}`)

		const res = await getToken(this.config.baseURL, {
			username: this.config.username,
			password: this.config.password,
		})

		this.log('info', `tokenRes:`)
		this.log('info', JSON.stringify(res))

		if (res.code === 0) {
			this.config.token = res.data.token
			this.updateStatus(InstanceStatus.Ok)
		} else if (res.code === 8274) {
			this.updateStatus(InstanceStatus.BadConfig)
		} else {
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
	}

	async getDeviceStatusByOpenDetail() {
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		this.log('info', `getDeviceStatusByOpenDetail-url:${this.config.baseURL} - ${new Date().toString()}`)

		const res = await getOpenDetail(this.config.baseURL, this.config.UCenterFlag)
		this.log('info', `getDeviceStatusByOpenDetail-res:${JSON.stringify(res)}`)

		if (res.code === 0) {
			this.config.token = generateToken(res.data.sn, res.data.startTime)
			this.log('info', `generateToken-res: ${this.config.token}`)
			this.updateStatus(InstanceStatus.Ok)

			if (HTTP_DEVICES.includes(this.config.modelId)) {
				this.getAllData()
				this.presetBeat = setInterval(() => this.getAllData(), 10000) //check every 10s
			}
		} else if (res.code === 8273) {
			this.log('info', `getDeviceStatusByOpenDetail-Interface exception: ${JSON.stringify(res)}`)
			throw Error('Interface exception')
		} else {
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
	}

	async getGlobalSwitchEffect() {
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		const res = await getSwitchEffect(this.config.baseURL, this.config.UCenterFlag, this.config.token)
		this.log('info', `${res?.code}`)
		if (res.code === 0) {
			this.config.globalSwitchEffect = res.data?.switchEffect || {}
		} else {
			this.log('info', `getGlobalSwitchEffect exception: ${JSON.stringify(res)}`)
		}
	}

	async getProtocol() {
		this.log('info', 'getProtocol')
		this.config.port = 19998
		const func = this.config.isOldVersion ? this.getDeviceStatusByPWD : this.getDeviceStatusByOpenDetail
		try {
			try {
				this.config.protocol = 'http'
				await retry(func.bind(this), RETRY_COUNT)
			} catch (e) {
				this.config.protocol = 'https'
				await retry(func.bind(this), RETRY_COUNT)
			}
			this.getGlobalSwitchEffect()
		} catch (e) {
			this.log('info', `getProtocol-${this.config.protocol}-cache-${e.code}`)
			if (!this.config.isOldVersion) {
				this.config.isOldVersion = true
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Please reconfigure the device connection information.')
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}
		}
	}

	async getPresetList() {
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		let obj = []
		try {
			const res = await getDevicePresets(this.config.baseURL, this.config.token, this)
			if (res.code === 0) {
				obj = res.data.list
			}
		} catch (e) {}
		this.log('log', JSON.stringify(obj))
		return obj
	}

	async getScreenList() {
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		let obj = []
		try {
			const res = await getScreenPresets(this.config.baseURL, this.config.token, this)
			if (res.code === 0) {
				// 屏幕类型：【0：空屏幕；2:普通屏幕;4:AUX屏幕;8:MVR屏幕；16:回显屏幕；32：led屏幕】
				// 目前只展示普通屏幕
				obj = (res.data.list ?? []).filter((item) => item.enable == 1)
			}
		} catch (e) {}
		return obj
	}

	async getLayerList() {
		this.log('info', `getLayerList2`)
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		// 由于图层需要拼接
		let obj = []
		try {
			const res = await getLayerPresets(this.config.baseURL, this.config.token, this)
			if (res.code === 0) {
				// 源类型 【 0：空图层 1：无源； 2：输入类型；3：PGM；4：PVW； 5：BKG图片 6：LOGO图片  7：IPC类型8：截取源类型 9:   拼接源 10: ipc拼接屏11: 内置源12：内置图形源 13：图片OSD 14:文字OSD】
				// 空图层不展示
				obj = (res.data.list ?? []).filter((item) => item?.source?.general?.sourceType !== 0)
			}
		} catch (e) {}
		return obj
	}

	async getSourceList() {
		this.log('info', `getLayerList2`)
		this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
		// 由于图层需要拼接
		let obj = []
		try {
			const res = await getSourcePresets(this.config.baseURL, this.config.token, this)
			if (res.code === 0) {
				obj = res.data.list
			}
		} catch (e) {}
		return obj
	}

	async getAllData() {
		Promise.all([this.getPresetList(), this.getScreenList(), this.getLayerList(), this.getSourceList()]).then((res) => {
			const presetList = res[0]
			const screenList = res[1]
			const screenFilterLiter = screenList.filter((item) => item.screenIdObj.type === 2 || item.screenIdObj.type === 4)
			const layerList = res[2]
			const sourceList = res[3]

			this.presetDefinitionPreset = {}
			this.presetDefinitionScreen = {}
			this.presetDefinitionLayer = {}
			this.presetDefinitionSource = {}
			this.presetList = presetList

			// 处理图层的数据
			this.presetDefinitionPreset = getPresetFormatData(presetList, this)
			this.presetDefinitionScreen = getScreenFormatData(screenFilterLiter, this)
			this.presetDefinitionLayer = getLayerFormatData(layerList, screenList, this)
			this.presetDefinitionSource = getSourceFormatData(sourceList, this)

			this.setPresetDefinitions({
				...getPresetDefinitions(this),
				...this.presetDefinitionPreset,
				...this.presetDefinitionScreen,
				...this.presetDefinitionLayer,
				...this.presetDefinitionSource,
			})

			this.updateActions()
			this.updateFeedbacks()
		})
	}

	/** devices http handle end */

	/** devices cmd handle start */
	//update device status
	updateDeviceStatus(isAlive) {
		this.log('debug', 'ping test:' + isAlive + ', lastState:' + this.lastState)
		if (isAlive == true) {
			this.log('debug', 'ping check ok.')
			if (this.lastState !== 0) {
				this.log('info', 'connection recover, try to reconnect device.')
				this.updateStatus(InstanceStatus.Connecting)
				//try to reconnect
				this.initUDP()
				this.initTCP()
				this.lastState = 0
			}
		} else {
			if (isAlive == false && this.lastState === 0) {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('info', 'ping check failure.')
				this.lastState = 1
			}
		}
	}

	pingTest() {
		ping.sys.probe(this.config.host, (isAlive) => this.updateDeviceStatus(isAlive), { timeout: 1 })
	}

	initTCP() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		this.config.port = 5400

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('error', 'Network error: ' + err.message)
				console.log('TCP Connection error, Try to reconnect.')
				this.updateStatus(InstanceStatus.Connecting)
				if (this.udp !== undefined) {
					let cmd_connect = Buffer.from([
						0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
						0x00, 0x03, 0xfe, 0xff,
					]) // Port FFFE
					this.udp.send(cmd_connect)
				} else {
					this.initUDP()
				}
			})

			this.socket.on('connect', () => {
				let cmd = Buffer.from([
					0x55, 0xaa, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00,
					0x57, 0x56,
				])
				this.socket.send(cmd)
				this.log('debug', 'Connected')
				this.updateStatus(InstanceStatus.Ok)
			})

			// if we get any data, display it to stdout
			this.socket.on('data', (buffer) => {
				//future feedback can be added here
				// this.log('debug', 'Tcp recv:' + buffer);
			})
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	initUDP() {
		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}

		if (this.config.host !== undefined) {
			this.udp = new UDPHelper(this.config.host, 3800)

			this.udp.on('error', (err) => {
				this.debug('Network error', err)
				this.log('error', 'Network error: ' + err.message)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})

			// If we get data, thing should be good
			this.udp.on('data', () => {
				// this.status(this.STATE_WARNING, 'Connecting...')
			})

			this.udp.on('status_change', (status, message) => {
				this.log('debug', 'UDP status_change: ' + status)
			})
			this.log('debug', 'initUDP finish')
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}

		if (this.udp !== undefined) {
			let cmd_register = Buffer.from([
				0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
				0x00, 0x03, 0xfe, 0xff,
			])
			this.udp.send(cmd_register)
			this.log('info', 'UDP registration.')
		}
	}
	/** devices cmd handle end */

	updateDefaultInfo() {
		LATCH_ACTIONS.map((item) => {
			delete this.config[item]
		})
		this.updateActions()
		this.updateFeedbacks()
		this.setPresetDefinitions(getPresetDefinitions(this))
	}

	async configUpdated(config) {
		this.log('info', 'configUpdated modules...')
		this.updateStatus(InstanceStatus.Connecting)
		let resetConnection = false
		if (this.config.host !== config.host || this.config.modelId !== config.modelId) {
			resetConnection = true
		}

		delete this.config.token
		resetConnection && delete this.config.isOldVersion
		this.config = {
			...this.config,
			...config,
			model: this.DEVICES_INFO[config.modelId],
		}

		if (HTTP_DEVICES.includes(this.config.modelId)) {
			this.log('info', 'http configUpdated handle...')
			this.log('debug', `this.config:${JSON.stringify(this.config)}`)
			if (this.socket !== undefined) {
				this.socket.destroy()
			}
			if (this.heartbeat) {
				clearInterval(this.heartbeat)
				delete this.heartbeat
			}
			if (this.presetBeat) {
				clearInterval(this.heartbeat)
				delete this.heartbeat
			}

			this.screenSelect = {}
			this.layerSelect = {}

			await this.getDevicesByUCenter()

			this.updateDefaultInfo.bind(this)()
		} else {
			const isRefresh = resetConnection === true || this.socket === undefined
			if (!isRefresh) return

			if (this.heartbeat) {
				clearInterval(this.heartbeat)
				delete this.heartbeat
			}

			this.initUDP()
			this.initTCP()
			this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s

			this.updateDefaultInfo.bind(this)()
		}
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)

		this.config = Object.assign({}, config)

		if (this.config.modelId !== undefined) {
			this.config.model = this.DEVICES_INFO[this.config.modelId]
		} else {
			this.config.modelId = this.DEVICES[0].id
			this.config.model = this.DEVICES[0]
		}

		// 初始化并再次更新设备恩协议及设备状态
		if (CMD_DEVICES.includes(this.config.modelId)) {
			this.initUDP()
			this.initTCP()
			this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s
		} else if (HTTP_DEVICES.includes(this.config.modelId)) {
			await Promise.race([
				new Promise((resolve) =>
					setTimeout(() => {
						this.log('info', 'promise-race-5...')
						resolve()
					}, 5000)
				),
				this.getDevicesByUCenter(),
			])
		}

		this.updateDefaultInfo.bind(this)()
	}
}

runEntrypoint(ModuleInstance, upgradeScripts)
