import { ModelKey } from '../config/modelMap.js'
import { P10 } from './devices/P10.js'
import { P20 } from './devices/P20.js'
import { P80 } from './devices/P80.js'
import { Q8 } from './devices/Q8.js'
import { PF } from './devices/PF.js'

export interface MachineConfig {
	protocol: 'http' | 'https'
	apiPortStrategy: 'fromDeviceListHttpProtocol' | 'fixed'
	fixedApiPort?: number
	discovery: {
		protocol: 'http' | 'https'
		port: number
		httpsRejectUnauthorized?: boolean
	}
	basePath: string
	/** All endpoints that may vary by model/firmware */
	endpoints: {
		screen: {
			take: string
			cut: string
			ftb: string
			freeze: string
			select: string
			listDetail: string
		}
		preset: {
			list: string
			apply: string
		}
		layers: {
			listDetail: string
			zorder: string
			window: string
			umd: string
			layerPresetListDetail: string
			layerPresetApply: string
			interfaces: string
		}
	}
}

export const MACHINE_CONFIGS: Record<ModelKey, MachineConfig> = {
	P10,
	P20,
	P80,
	Q8,
	PF,
}
