import got from 'got'
import { generateToken } from './utils.js'
import { ModuleInstance } from './main.js'
import { ScreenListDetailData } from './interfaces/Screen.js'
import { PresetListDetailData } from './interfaces/Preset.js'
import { SwapStateData } from './interfaces/Swap.js'
import { Response } from './interfaces/Response.js'
import { Layer, LayerListDetailData } from './interfaces/Layer.js'
import * as console from 'node:console'

export class APIClient {
	host: string | null = null
	apiPort: number | null = null
	unicoPort = 19998

	token: string | null = null

	async setup(instance: ModuleInstance): Promise<void> {
		const devices = await this._getDeviceList()
		this.apiPort = [...devices.data.list[0].protocols].find((protocol: any) => protocol.linkType === 'http').port

		const openDetail = await this._getDeviceOpenDetail()
		const serialNumber = openDetail.data.sn
		const startTime = openDetail.data.startTime
		this.token = generateToken(serialNumber, startTime)

		const screenResponse = await this.getScreens()
		const presetResponse = await this.getPresets()
		const swapStateResponse = await this.getSwapState()
		const layerResponse = await this.getLayers()

		instance.screens = screenResponse.data.list
		instance.presets = presetResponse.data.list
		instance.swapEnabled = swapStateResponse.data.enable === 1
		instance.layers = layerResponse.data.list
	}

	async _getDeviceOpenDetail(): Promise<any> {
		return got.get(`http://${this.host}:${this.apiPort}/unico/v1/node/open-detail`).json()
	}

	async _getDeviceList(): Promise<any> {
		return got
			.get(`https://${this.host}:${this.unicoPort}/unico/v1/ucenter/device-list`, {
				https: {
					rejectUnauthorized: false,
				},
			})
			.json()
	}

	async take(customEffect: boolean = false, time: number = 500): Promise<any> {
		const body = {
			direction: 0,
			effectSelect: customEffect ? 1 : 0,
			switchEffect: {
				time: time,
				type: 1,
			},
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/selected/take`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async cut(direction: number = 0): Promise<any> {
		const body = {
			direction: +direction || 0,
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/selected/cut`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async ftb(enable: boolean, time: number): Promise<any> {
		const body = {
			ftb: {
				enable: enable ? 1 : 0,
				time,
			},
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/selected/ftb`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async freeze(enable: boolean): Promise<any> {
		const body = {
			freeze: enable ? 1 : 0,
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/selected/freeze`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async swap(enable: boolean): Promise<any> {
		const body = {
			enable: enable ? 1 : 0,
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/global/swap`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async loadPreset(presetId: number, sceneType: number): Promise<any> {
		const body = {
			sceneType, //HTTP_PRESET_TYPE[this.config.presetType],
			presetId,
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/preset/play`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async selectScreen(screenId: number, selected: boolean): Promise<any> {
		const body = [
			{
				screenId,
				select: selected ? 1 : 0,
			},
		]

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/select`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async selectLayer(layerId: number, otherLayers: Layer[]): Promise<any> {
		const body = [
			{
				layerId,
				selected: 1,
			},
			...otherLayers
				.filter((layer) => {
					return layer.selected === 1
				})
				.map((layer) => {
					return {
						layerId: layer.layerId,
						selected: 0,
					}
				}),
		]

		console.log(body)

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/layers/select`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async bringSelectedTo(layerId: number, to: number): Promise<any> {
		const body = [
			{
				layerId: layerId,
				zorder: {
					type: 1,
					para: to,
				},
			},
		]

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/layers/zorder`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async setEffectTime(time: number): Promise<any> {
		const body = {
			switchEffect: {
				time,
				type: 1,
			},
		}

		return got
			.put(`http://${this.host}:${this.apiPort}/unico/v1/screen/global/switch-effect`, {
				headers: {
					Authorization: this.token!,
				},
				json: body,
			})
			.json()
	}

	async getScreens(): Promise<Response<ScreenListDetailData>> {
		return got
			.get(`http://${this.host}:${this.apiPort}/unico/v1/screen/list-detail`, {
				headers: {
					Authorization: this.token!,
				},
			})
			.json()
	}

	async getPresets(): Promise<Response<PresetListDetailData>> {
		return got
			.get(`http://${this.host}:${this.apiPort}/unico/v1/preset/list-detail`, {
				headers: {
					Authorization: this.token!,
				},
			})
			.json()
	}

	async getSwapState(): Promise<Response<SwapStateData>> {
		return got
			.get(`http://${this.host}:${this.apiPort}/unico/v1/screen/global/swap`, {
				headers: {
					Authorization: this.token!,
				},
			})
			.json()
	}

	async getLayers(): Promise<Response<LayerListDetailData>> {
		return got
			.get(`http://${this.host}:${this.apiPort}/unico/v1/layers/list-detail`, {
				headers: {
					Authorization: this.token!,
				},
			})
			.json()
	}
}
