import got from 'got'
import { generateToken } from '../utils/utils.js'
import { ModuleInstance } from '../main.js'
import { Screen, ScreenListDetailData } from '../interfaces/Screen.js'
import { Preset, PresetListDetailData } from '../interfaces/Preset.js'
import { Response } from '../interfaces/Response.js'
import { Layer, LayerBounds, LayerListDetailData, LayerUMD } from '../interfaces/Layer.js'
import { HttpClient } from './HttpClient.js'
import { LayerPreset, LayerPresetListDetailData } from '../interfaces/LayerPreset.js'
import { Interface, InterfacesListDetailData } from '../interfaces/Interface.js'

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

		instance.log('debug', 'Get Screens')
		const screenResponse = await this.getScreens()
		instance.log('debug', 'Get Presets')
		const presetResponse = await this.getPresets()
		instance.log('debug', 'Get Layers')
		const layerResponse = await this.getLayers()
		instance.log('debug', 'Get Layer Presets')
		const layerPresetsResponse = await this.getLayerPresets()
		instance.log('debug', 'Get Interfaces')
		const interfacesResponse = await this.getInterfaces()

		instance.screens = screenResponse.data.list
		instance.presets = presetResponse.data.list
		instance.layers = layerResponse.data.list
		instance.layerPresets = layerPresetsResponse.data.list
		instance.interfaces = interfacesResponse.data.list
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

	async take(screens: Screen[], swap: boolean = true, customEffect: boolean = false, time: number = 500): Promise<any> {
		const body = screens.map((screen) => {
			return {
				direction: 0,
				effectSelect: customEffect ? 1 : 0,
				screenGuid: screen.guid,
				screenId: screen.screenId,
				screenName: screen.general.name,
				swapEnable: swap ? 1 : 0,
				switchEffect: {
					type: 1,
					time,
				},
			}
		})

		return this.http!.put('/unico/v1/screen/take', body)
	}

	async cut(screens: Screen[], direction: number = 0, swap: boolean = true): Promise<any> {
		const body = screens.map((screen) => {
			return {
				direction: +direction || 0,
				screenId: screen.screenId,
				swapEnable: swap ? 1 : 0,
			}
		})

		console.log(body)

		return this.http!.put('/unico/v1/screen/cut', body)
	}

	async ftb(screens: Screen[], enable: boolean, time: number): Promise<any> {
		const body = screens.map((screen) => {
			let ftb = 1
			if (global) {
				ftb = enable ? 1 : 0
			} else {
				ftb = screen.ftb.enable === 1 ? 0 : 1
			}

			return {
				screenId: screen.screenId,
				ftb: {
					enable: ftb,
					time,
				},
			}
		})

		return this.http!.put('/unico/v1/screen/ftb', body)
	}

	async freeze(screens: Screen[], enable: boolean | null): Promise<any> {
		const body = screens.map((screen) => {
			const global = enable !== null

			let freeze = 1
			if (global) {
				freeze = enable ? 1 : 0
			} else {
				freeze = screen.freeze === 1 ? 0 : 1
			}

			return {
				screenId: screen.screenId,
				freeze,
			}
		})

		return this.http!.put('/unico/v1/screen/freeze', body)
	}

	async loadPreset(preset: Preset, targetRegion: number): Promise<any> {
		const body = {
			auxiliary: {
				keyFrame: {
					enable: 1,
				},
				switchEffect: {
					type: 1,
					time: 500,
				},
				swapEnable: 1,
				effect: {
					enable: 1,
				},
			},
			serial: preset.serial,
			targetRegion, //HTTP_PRESET_TYPE[this.config.presetType],
			presetId: preset.guid,
		}

		console.log(JSON.stringify(body))

		return this.http!.post('/unico/v1/preset/apply', body)
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

		return this.http!.put('/unico/v1/screen/select', body)
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

	async applyLayerPreset(layerId: number, layerPreset: LayerPreset): Promise<any> {
		const body = [
			{
				layerIds: [{ layerId }],
				layerPreset: layerPreset,
			},
		]

		return this.http!.put('/unico/v1/layers/layer-preset/apply', body)
	}

	async applyLayerBounds(layerId: number, bounds: LayerBounds): Promise<any> {
		const body = [
			{
				layerId,
				window: bounds,
			},
		]

		return this.http!.put('/unico/v1/layers/window', body)
	}

	async applyUMD(layerId: number, umd: LayerUMD[]): Promise<any> {
		const body = [
			{
				layerId,
				UMD: umd,
			},
		]

		return this.http!.put('/unico/v1/layers/umd', body)
	}

	async setInputOnLayer(layer: Layer, input: Interface): Promise<any> {
		const body = [
			{
				layerId: layer.layerId,
				source: {
					general: {
						sourceId: input.interfaceId,
						sourceType: input.auxiliaryInfo.connectorInfo.interfaceType,
						connectorType: input.auxiliaryInfo.connectorInfo.type,
					},
				},
			},
		]

		return this.http!.put('/unico/v1/layers/source', body)
	}

	async getScreens(): Promise<Response<ScreenListDetailData>> {
		return this.http!.get('/unico/v1/screen/list-detail')
	}

	async getPresets(): Promise<Response<PresetListDetailData>> {
		return this.http!.get('/unico/v1/preset')
	}

	async getLayers(): Promise<Response<LayerListDetailData>> {
		return this.http!.get('/unico/v1/layers/list-detail')
	}

	async getLayerPresets(): Promise<Response<LayerPresetListDetailData>> {
		return this.http!.get('/unico/v1/layers/layer-preset/list-detail')
	}

	async getInterfaces(): Promise<Response<InterfacesListDetailData>> {
		return this.http!.get('/unico/v1/interface/list-detail')
	}
}
