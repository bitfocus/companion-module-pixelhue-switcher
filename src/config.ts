import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

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
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Machine address or PixelFlow address',
				width: 6,
				regex: Regex.IP,
				required: true,
			},
			...(this.discoveredDevices.length > 1
				? [
						{
							type: 'dropdown' as const,
							id: 'deviceSn',
							label: 'Discovered device',
							width: 12,
							choices: this.discoveredDevices,
							default: this.config.deviceSn ?? this.discoveredDevices[0]?.id,
						},
					]
				: []),
		]
	}
}
