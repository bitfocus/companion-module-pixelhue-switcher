import {
	CompanionVariableValues,
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { APIClient } from './APIClient.js'
import { Screen } from './interfaces/Screen.js'
import { WebSocket } from 'ws'
import { parseWebsocketMessage } from './utils.js'
import { LoadIn, Preset } from './interfaces/Preset.js'
import { UpdatePresets } from './presets.js'
import { Layer } from './interfaces/Layer.js'
import { webSocketHandlers } from './WebSocketHandling.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	apiClient: APIClient | null = null
	webSocket: WebSocket | null = null

	screens: Screen[] = []
	presets: Preset[] = []
	layers: Layer[] = []
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

		this.apiClient = new APIClient()
		this.apiClient.host = config.host
		try {
			await this.apiClient.setup(this)
			this.webSocket = new WebSocket(`wss://${config.host}:19998/unico/v1/ucenter/ws?client-type=8`, {
				headers: {
					Authorization: this.apiClient.token!,
				},
				rejectUnauthorized: false,
			})

			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			this.updateVariableDefinitions() // export variable definitions
			this.updatePresets()
			this.updateVariableValues()

			this.updateStatus(InstanceStatus.Ok)

			this.webSocket.on('message', this.messageReceived.bind(this))
			this.webSocket.on('error', () => {
				this.error()
			})
			this.webSocket.on('close', () => {
				this.error()
			})
		} catch {
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
		if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.close()
		}
		this.webSocket = null

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
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
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

		this.setVariableValues({
			global_load_in: this.globalLoadPresetIn === LoadIn.preview ? 'Preview' : 'Program',
			global_load_in_short: this.globalLoadPresetIn === LoadIn.preview ? 'PVW' : 'PGM',
			global_load_in_program: this.globalLoadPresetIn === LoadIn.program,
			global_load_in_preview: this.globalLoadPresetIn === LoadIn.preview,
			take_action: this.swapEnabled ? 'Swap' : 'Copy',
			...presetVariables,
			...screenVariables,
		})
	}

	messageReceived(data: WebSocket.RawData): void {
		if (!(data instanceof Buffer)) return

		const parsedMessage = parseWebsocketMessage(Buffer.from(data))
		if (
			Object.keys(webSocketHandlers)
				.map(Number)
				.find((handlerId) => {
					return handlerId == parsedMessage.type
				})
		) {
			webSocketHandlers[parsedMessage.type](this, parsedMessage)
		}
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
