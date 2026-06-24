import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export const DEFAULT_DEVICE_SN = 'Default'

export const DEFAULT_DEVICE = { id: DEFAULT_DEVICE_SN, label: 'Default' }

export function isDefaultDeviceSn(deviceSn?: string): boolean {
	return !deviceSn?.trim() || deviceSn === DEFAULT_DEVICE_SN
}

export const defaultConfig = (): ModuleConfig => {
	return {
		host: '127.0.0.1',
		deviceSn: DEFAULT_DEVICE_SN,
	}
}

export interface ModuleConfig {
	host: string
	deviceSn?: string
}

export class Config {
	private discoveredDevices: { id: string; label: string }[]
	private config: ModuleConfig

	constructor(discoveredDevices: { id: string; label: string }[], config: ModuleConfig) {
		this.discoveredDevices = discoveredDevices
		this.config = config
	}

	public GetConfigFields(): SomeCompanionConfigField[] {
		const choices = [DEFAULT_DEVICE, ...this.discoveredDevices]
		const resolvedDefault =
			this.config.deviceSn && choices.some((choice) => choice.id === this.config.deviceSn)
				? this.config.deviceSn
				: DEFAULT_DEVICE_SN

		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Machine address or PixelFlow address',
				width: 6,
				regex: Regex.IP,
				required: true,
			},
			{
				type: 'dropdown' as const,
				id: 'deviceSn',
				label: 'Discovered device',
				width: 12,
				choices,
				default: resolvedDefault,
			},
		]
	}
}
