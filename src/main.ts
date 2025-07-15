import {
	CompanionVariableValues,
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { updateCompanionVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { updateCompanionActions } from './actions.js'
import { updateCompanionFeedbacks } from './feedbacks.js'
import { ApiClient } from './services/ApiClient.js'
import { Screen, SCREEN_TYPE } from './interfaces/Screen.js'
import { LoadIn, Preset } from './interfaces/Preset.js'
import { updateCompanionPresets } from './presets.js'
import { Layer } from './interfaces/Layer.js'
import { WebSocketClient } from './services/WebSocketClient.js'
import { LayerPreset } from './interfaces/LayerPreset.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	apiClient: ApiClient | null = null
	webSocket: WebSocketClient | null = null

	screens: Screen[] = []
	presets: Preset[] = []
	layers: Layer[] = []
	layerPresets: LayerPreset[] = []
	swapEnabled: boolean = false
	retryTimeout: NodeJS.Timeout | null = null

	globalLoadPresetIn: number = LoadIn.preview
	globalFtb: number = 0
	globalFreeze: number = 0

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		await this.configUpdated(config)
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.cleanup()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout)
			this.retryTimeout = null
		}

		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}

		try {
			this.apiClient = await ApiClient.create(this, this.config.host)
			this.webSocket = await WebSocketClient.create(this, this.config.host, this.apiClient.token!)

			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			this.updateVariableDefinitions() // export variable definitions
			this.updatePresets()
			this.updateVariableValues()

			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.log('error', `Initialization failed: ${err instanceof Error ? err.message : String(err)}`)
			this.error()
			return
		}
	}

	error(): void {
		this.updateStatus(InstanceStatus.ConnectionFailure)
		this.cleanup()

		this.retryTimeout = setTimeout(() => {
			void this.configUpdated.bind(this)(this.config)
		}, 5000)
	}

	cleanup(): void {
		this.apiClient = null
		if (this.webSocket) {
			this.webSocket.disconnect()
			this.webSocket = null
		}

		this.setActionDefinitions({})
		this.setFeedbackDefinitions({})
		this.setVariableDefinitions([])
		this.setPresetDefinitions({})
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		updateCompanionActions(this)
	}

	updateFeedbacks(): void {
		updateCompanionFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		updateCompanionVariableDefinitions(this)
	}

	updatePresets(): void {
		updateCompanionPresets(this)
	}

	updateVariableValues(): void {
		const presetVariables: CompanionVariableValues = {}
		this.presets.forEach((preset) => {
			presetVariables[`preset_${preset.keyPosition[0]}_name`] = preset.general.name
		})

		const screenVariables: CompanionVariableValues = {}
		this.screens.forEach((screen) => {
			screenVariables[`screen_${screen.screenId}_name`] = screen.general.name
			screenVariables[`screen_${screen.screenId}_freeze`] = screen.freeze === 1
			screenVariables[`screen_${screen.screenId}_ftb`] = screen.ftb.enable === 1
		})

		const layerVariables: CompanionVariableValues = {}
		this.layers.forEach((layer) => {
			const mvrScreen = this.screens.find((screen) => {
				return screen.screenIdObj.type === SCREEN_TYPE.MVR
			})
			const where =
				layer.layerIdObj.attachScreenId === mvrScreen?.screenId
					? 'mvr'
					: layer.layerIdObj.sceneType === LoadIn.preview
						? 'pvw'
						: 'pgm'
			let baseVariableId: string
			if (layer.layerIdObj.attachScreenId === mvrScreen?.screenId) {
				baseVariableId = `layer_${layer.serial}_${where}`
			} else {
				baseVariableId = `layer_${layer.serial}_${where}_screen_${layer.layerIdObj.attachScreenId}`
			}

			layerVariables[`${baseVariableId}_x`] = layer.window.x
			layerVariables[`${baseVariableId}_y`] = layer.window.y
			layerVariables[`${baseVariableId}_width`] = layer.window.width
			layerVariables[`${baseVariableId}_height`] = layer.window.height
		})

		this.setVariableValues({
			global_load_in: this.globalLoadPresetIn === LoadIn.preview ? 'Preview' : 'Program',
			global_load_in_short: this.globalLoadPresetIn === LoadIn.preview ? 'PVW' : 'PGM',
			global_load_in_program: this.globalLoadPresetIn === LoadIn.program,
			global_load_in_preview: this.globalLoadPresetIn === LoadIn.preview,
			take_action: this.swapEnabled ? 'Swap' : 'Copy',
			selected_layer: selectedLayer?.layerId,
			...presetVariables,
			...screenVariables,
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
