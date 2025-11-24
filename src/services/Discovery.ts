import got from 'got'

export interface DiscoveredDevice {
	SN: string
	modelId: number
	deviceName: string
	ip: string
	protocols: Array<{ linkType: string; port: number }>
}

export async function discoverDevices(host: string): Promise<DiscoveredDevice[]> {
	const resp = await got
		.get(`https://${host}:19998/unico/v1/ucenter/device-list`, {
			https: {
				rejectUnauthorized: false, // allow self-signed cert
			},
		})
		.json<any>()

	// Safely unwrap nested structure
	const list = resp?.data?.list
	if (!Array.isArray(list)) {
		throw new Error(`Unexpected response structure from ${host}:19998/unico/v1/ucenter/device-list`)
	}

	return list as DiscoveredDevice[]
}
