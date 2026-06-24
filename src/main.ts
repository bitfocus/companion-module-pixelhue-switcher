import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { Config, DEFAULT_DEVICE_SN, defaultConfig, isDefaultDeviceSn, type ModuleConfig } from './config.js'
import { updateCompanionVariableDefinitions, updateVariableValues } from './variables.js'
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
import { Interface } from './interfaces/Interface.js'
import { CropSource } from './interfaces/CropSource.js'
import { discoverDevices } from './services/Discovery.js'
import { SourceBackup } from './interfaces/SourceBackup.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config: ModuleConfig = defaultConfig() // Setup in init()
	apiClient: ApiClient | null = null
	webSocket: WebSocketClient | null = null

	discoveredDevices: Array<{ id: string; label: string }> = []
	/** Device SN bound to this module; matched against WebSocket header.sn to filter cross-device reports */
	deviceSn: string | null = null

	screens: Screen[] = []
	presets: Preset[] = []
	layers: Layer[] = []
	layerPresets: LayerPreset[] = []
	interfaces: Interface[] = []
	cropSources: CropSource[] = []
	sourceBackups: SourceBackup = { sourceBackup: { backup: [], enable: 0, primaryFirst: 0 } }
	swapEnabled: boolean = true
	effectTime: number = 1000
	retryTimeout: NodeJS.Timeout | null = null
	wsReconnectTimeout: NodeJS.Timeout | null = null
	wsReconnectAttempt = 0

	globalLoadPresetIn: number = LoadIn.preview
	globalFtb: number = 0
	globalFreeze: number = 0

	linkedSourceNameCache: Map<string, string> | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		await this.configUpdated(config)
	}
	async destroy(): Promise<void> {
		this.cleanup()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = {
			...defaultConfig(),
			...config,
		}

		if (this.config.deviceSn?.trim() === '') {
			this.config.deviceSn = undefined
		}

		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout)
			this.retryTimeout = null
		}

		this.cleanupConnections()

		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host is required')
			return
		}

		void this.runConnection()
	}
	private async runConnection(): Promise<void> {
		try {
			const devices = await discoverDevices(this.config.host)
			this.log('debug', `Discovered devices: ${JSON.stringify(devices)}`)
			this.discoveredDevices = devices.map((d) => ({
				id: d.SN,
				label: `${d.deviceName || 'Device'} (${d.SN}) – ${d.ip}`,
			}))

			if (devices.length === 0) {
				this.updateStatus(InstanceStatus.BadConfig, 'No devices discovered.')
				this.cleanup()
				return
			}

			// getConfigFields().default only applies on first connection; saveConfig is required after discovery to refresh the dropdown selection
			if (isDefaultDeviceSn(this.config.deviceSn)) {
				this.config = {
					...this.config,
					deviceSn: DEFAULT_DEVICE_SN,
				}
				this.saveConfig(this.config)
			} else {
				const exists = devices.some((d) => d.SN === this.config.deviceSn)

				if (!exists) {
					this.updateStatus(
						InstanceStatus.BadConfig,
						`Configured device SN "${this.config.deviceSn}" not found. Please select a new device in the config.`,
					)
					this.log('warn', `Configured device SN "${this.config.deviceSn}" not found in discovery result.`)

					this.log('info', `Resetting invalid device SN "${this.config.deviceSn}" to Default`)
					this.config = {
						...this.config,
						deviceSn: DEFAULT_DEVICE_SN,
					}
					this.saveConfig(this.config)

					this.cleanup()
					return
				}
			}

			const targetSn = isDefaultDeviceSn(this.config.deviceSn) ? devices[0].SN : this.config.deviceSn!
			this.apiClient = await ApiClient.create(this, this.config.host, { targetSn })
			this.webSocket = await WebSocketClient.create(this, this.config.host, this.apiClient.token!)

			this.log('debug', 'Initialization successful')
			this.log('debug', `Using sourceBackups: ${JSON.stringify(this.sourceBackups)}`)

			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
			this.updatePresets()
			this.updateVariableValues()
			this.checkFeedbacks('sourceSignalState')

			this.updateStatus(InstanceStatus.Ok)

			this.saveConfig({
				...this.config,
			})
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err)
			this.log('error', `Initialization failed: ${msg}`)

			if (msg.startsWith('No device with SN "') || msg === 'No devices discovered.') {
				this.updateStatus(InstanceStatus.BadConfig, msg)
				this.cleanup()
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure, msg)
				this.error()
			}
		}
	}

	error(): void {
		this.updateStatus(InstanceStatus.ConnectionFailure)
		this.cleanup()

		if (this.retryTimeout != null) {
			// A retry is already scheduled; don't queue more
			return
		}

		this.retryTimeout = setTimeout(() => {
			this.retryTimeout = null
			void this.configUpdated(this.config)
		}, 5000)
	}

	handleWebSocketDisconnect(): void {
		if (this.wsReconnectTimeout != null) return

		this.log('warn', 'WebSocket disconnected')
		this.updateStatus(InstanceStatus.ConnectionFailure, 'WebSocket disconnected')

		if (this.webSocket) {
			this.webSocket.disconnect()
			this.webSocket = null
		}

		const delay = Math.min(1000 * 2 ** this.wsReconnectAttempt, 30000)
		this.wsReconnectTimeout = setTimeout(() => {
			this.wsReconnectTimeout = null
			void this.reconnectWebSocket()
		}, delay)
	}

	private async reconnectWebSocket(): Promise<void> {
		const token = this.apiClient?.token
		if (!token || !this.config.host) {
			this.wsReconnectAttempt = 0
			this.error()
			return
		}

		try {
			this.webSocket = await WebSocketClient.create(this, this.config.host, token)
			this.wsReconnectAttempt = 0
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err)
			this.log('error', `WebSocket reconnect failed: ${msg}`)
			this.wsReconnectAttempt++

			if (this.wsReconnectAttempt >= 10) {
				this.wsReconnectAttempt = 0
				this.error()
				return
			}

			this.handleWebSocketDisconnect()
		}
	}

	cleanup(): void {
		this.cleanupConnections()

		this.deviceSn = null
		this.screens = []
		this.presets = []
		this.layers = []
		this.layerPresets = []
		this.interfaces = []
		this.cropSources = []
		this.sourceBackups = { sourceBackup: { backup: [], enable: 0, primaryFirst: 0 } }

		this.setActionDefinitions({})
		this.setFeedbackDefinitions({})
		this.setVariableDefinitions([])
		this.setPresetDefinitions({})
	}

	private cleanupConnections(): void {
		if (this.wsReconnectTimeout) {
			clearTimeout(this.wsReconnectTimeout)
			this.wsReconnectTimeout = null
		}
		this.wsReconnectAttempt = 0

		if (this.webSocket) {
			this.webSocket.disconnect()
			this.webSocket = null
		}
		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout)
			this.retryTimeout = null
		}
		this.apiClient = null
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return new Config(this.discoveredDevices, this.config ?? { host: '' }).GetConfigFields()
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

	getScreens(allowedScreenTypes: number[] = [SCREEN_TYPE.SCREEN]): Screen[] {
		return this.screens
			.filter((screen) => {
				return allowedScreenTypes.includes(screen.screenIdObj.type)
			})
			.filter((screen) => {
				return screen.enable === 1
			})
	}

	getInterfaces(type: number, workMode: number): Interface[] {
		return this.interfaces.filter((interfaceO) => {
			return (
				interfaceO.auxiliaryInfo.connectorInfo.interfaceType === type &&
				interfaceO.auxiliaryInfo.connectorInfo.workMode === workMode
			)
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
