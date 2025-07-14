import got from 'got'
import { generateToken } from '../utils/utils.js'
import { ModuleInstance } from '../main.js'
import { ScreenListDetailData } from '../interfaces/Screen.js'
import { PresetListDetailData } from '../interfaces/Preset.js'
import { SwapStateData } from '../interfaces/Swap.js'
import { Response } from '../interfaces/Response.js'
import { Layer, LayerListDetailData } from '../interfaces/Layer.js'
import { HttpClient } from './HttpClient.js'
import { LayerPreset, LayerPresetListDetailData } from '../interfaces/LayerPreset.js'

export class ApiClient {
	http: HttpClient | null = null
	host: string | null = null
	apiPort: number | null = null
	unicoPort = 19998

	token: string | null = null

	private constructor() {}

	static async create(instance: ModuleInstance, host: string): Promise<ApiClient> {
		const client = new ApiClient()
		client.host = host
		await client.setup(instance)
		return client
	}

	async setup(instance: ModuleInstance): Promise<void> {
		const devices = await this._getDeviceList()
		this.apiPort = [...devices.data.list[0].protocols].find((protocol: any) => protocol.linkType === 'http').port
		this.http = new HttpClient(this.host!, this.apiPort!)

		const openDetail = await this._getDeviceOpenDetail()
		const serialNumber = openDetail.data.sn
		const startTime = openDetail.data.startTime
		this.token = generateToken(serialNumber, startTime)
		this.http.setToken(this.token)

		const screenResponse = await this.getScreens()
		const presetResponse = await this.getPresets()
		const swapStateResponse = await this.getSwapState()
		const layerResponse = await this.getLayers()
		const layerPresetsResponse = await this.getLayerPresets()

		instance.screens = screenResponse.data.list
		instance.presets = presetResponse.data.list
		instance.swapEnabled = swapStateResponse.data.enable === 1
		instance.layers = layerResponse.data.list
		instance.layerPresets = layerPresetsResponse.data.list
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

		return this.http!.put('/unico/v1/screen/selected/take', body)
	}

	async cut(direction: number = 0): Promise<any> {
		const body = {
			direction: +direction || 0,
		}

		return this.http!.put('/unico/v1/screen/selected/cut', body)
	}

	async ftb(enable: boolean, time: number): Promise<any> {
		const body = {
			ftb: {
				enable: enable ? 1 : 0,
				time,
			},
		}

		return this.http!.put('/unico/v1/screen/selected/ftb', body)
	}

	async freeze(enable: boolean): Promise<any> {
		const body = {
			freeze: enable ? 1 : 0,
		}

		return this.http!.put('/unico/v1/screen/selected/freeze', body)
	}

	async swap(enable: boolean): Promise<any> {
		const body = {
			enable: enable ? 1 : 0,
		}

		return this.http!.put('/unico/v1/screen/global/swap', body)
	}

	async loadPreset(presetId: number, sceneType: number): Promise<any> {
		const body = {
			sceneType, //HTTP_PRESET_TYPE[this.config.presetType],
			presetId,
		}

		return this.http!.put('/unico/v1/preset/play', body)
	}

	async selectScreen(screenId: number, selected: boolean): Promise<any> {
		const body = [
			{
				screenId,
				select: selected ? 1 : 0,
			},
		]

		return this.http!.put('/unico/v1/screen/select', body)
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

		return this.http!.put('/unico/v1/layers/select', body)
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

		return this.http!.put('/unico/v1/layers/zorder', body)
	}

	async setEffectTime(time: number): Promise<any> {
		const body = {
			switchEffect: {
				time,
				type: 1,
			},
		}

		return this.http!.put('/unico/v1/screen/global/switch-effect', body)
	}

	async applyLayerPreset(layerId: number, layerPreset: LayerPreset): Promise<any> {
		const body = [
			{
				layerIds: [{ layerId }],
				layerPreset: layerPreset,
			},
		]

		return this.http!.put('/unico/v1/layers/layer-preset/apply', body)
	}

	async getScreens(): Promise<Response<ScreenListDetailData>> {
		return this.http!.get('/unico/v1/screen/list-detail')
	}

	async getPresets(): Promise<Response<PresetListDetailData>> {
		return this.http!.get('/unico/v1/preset/list-detail')
	}

	async getSwapState(): Promise<Response<SwapStateData>> {
		return this.http!.get('/unico/v1/screen/global/swap')
	}

	async getLayers(): Promise<Response<LayerListDetailData>> {
		return this.http!.get('/unico/v1/layers/list-detail')
	}

	async getLayerPresets(): Promise<Response<LayerPresetListDetailData>> {
		return this.http!.get('/unico/v1/layers/layer-preset/list-detail')
	}
}
