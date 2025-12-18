import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export const defaultConfig = (): ModuleConfig => {
	return {
		host: '',
	}
}

export interface ModuleConfig {
	host: string
}

export class Config {
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
		]
	}
}
