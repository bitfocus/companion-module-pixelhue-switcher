import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { Config, type ModuleConfig } from './config.js'
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
import { discoverDevices } from './services/Discovery.js'
import { SourceBackup } from './interfaces/SourceBackup.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	apiClient: ApiClient | null = null
	webSocket: WebSocketClient | null = null

	discoveredDevices: Array<{ id: string; label: string }> = []

	screens: Screen[] = []
	presets: Preset[] = []
	layers: Layer[] = []
	layerPresets: LayerPreset[] = []
	interfaces: Interface[] = []
	sourceBackups: SourceBackup = { sourceBackup: { backup: [], enable: 0, primaryFirst: 0 } }
	swapEnabled: boolean = true
	effectTime: number = 1000
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
			this.updateStatus(InstanceStatus.BadConfig, 'Host is required')
			return
		}

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

			if (devices.length > 1 && !this.config.deviceSn) {
				this.updateStatus(
					InstanceStatus.BadConfig,
					'Multiple devices found. Please select which one to control in the config.',
				)
				this.cleanup()
				return
			}

			if (this.config.deviceSn) {
				const exists = devices.some((d) => d.SN === this.config.deviceSn)

				if (!exists) {
					this.updateStatus(
						InstanceStatus.BadConfig,
						`Configured device SN "${this.config.deviceSn}" not found. Please select a new device in the config.`,
					)
					this.log('warn', `Configured device SN "${this.config.deviceSn}" not found in discovery result.`)
					this.cleanup()
					return
				}
			}

			const targetSn = this.config.deviceSn ?? devices[0].SN

			this.apiClient = await ApiClient.create(this, this.config.host, { targetSn })
			this.webSocket = await WebSocketClient.create(this, this.config.host, this.apiClient.token!)

			this.log('debug', 'Initialization successful')
			this.log('debug', `Using sourceBackups: ${JSON.stringify(this.sourceBackups)}`)

			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
			this.updatePresets()
			this.updateVariableValues()

			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err)
			this.log('error', `Initialization failed: ${msg}`)

			if (msg.startsWith('No device with SN "') || msg === 'No devices discovered.') {
				this.updateStatus(InstanceStatus.BadConfig, msg)
				this.cleanup()
			} else {
				this.error()
			}
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

		this.screens = []
		this.presets = []
		this.layers = []
		this.layerPresets = []
		this.interfaces = []
		this.sourceBackups = { sourceBackup: { backup: [], enable: 0, primaryFirst: 0 } }

		this.setActionDefinitions({})
		this.setFeedbackDefinitions({})
		this.setVariableDefinitions([])
		this.setPresetDefinitions({})

		if (this.config?.deviceSn) {
			this.log('info', `Clearing invalid device SN "${this.config.deviceSn}"`)
			this.saveConfig({
				...this.config,
				deviceSn: undefined, // or ''
			})
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return new Config(this.discoveredDevices, this.config).GetConfigFields()
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
