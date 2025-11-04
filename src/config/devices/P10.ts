import { MachineConfig } from '../machineConfig.js'

export const P10: MachineConfig = {
	protocol: 'http',
	apiPortStrategy: 'fromDeviceListHttpProtocol',
	discovery: { protocol: 'https', port: 19998, httpsRejectUnauthorized: false },
	basePath: '/unico/v1',
	endpoints: {
		screen: {
			take: '/unico/v1/screen/take',
			cut: '/unico/v1/screen/cut',
			ftb: '/unico/v1/screen/ftb',
			freeze: '/unico/v1/screen/freeze',
			select: '/unico/v1/screen/select',
			listDetail: '/unico/v1/screen/list-detail',
		},
		preset: {
			list: '/unico/v1/preset',
			apply: '/unico/v1/preset/apply',
		},
		layers: {
			listDetail: '/unico/v1/layers/list-detail',
			zorder: '/unico/v1/layers/zorder',
			window: '/unico/v1/layers/window',
			umd: '/unico/v1/layers/umd',
			layerPresetListDetail: '/unico/v1/layers/layer-preset/list-detail',
			layerPresetApply: '/unico/v1/layers/layer-preset/apply',
			interfaces: '/unico/v1/interface/list-detail',
		},
	},
}
