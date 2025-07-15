import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { updateCompanionVariableDefinitions, updateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { updateCompanionActions } from './actions.js'
import { updateCompanionFeedbacks } from './feedbacks.js'
import { ApiClient } from './services/ApiClient.js'
import { Screen } from './interfaces/Screen.js'
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
		updateVariableValues(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
