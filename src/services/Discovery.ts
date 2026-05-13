import got from 'got'

export interface DiscoveredDevice {
	SN: string
	modelId: number
	deviceName: string
	ip: string
	mac?: string
	protocols: Array<{ linkType: string; port: number }>
}

export async function discoverDevices(host: string, includeClientType: boolean = false): Promise<DiscoveredDevice[]> {
	try {
		const url = includeClientType
			? `https://${host}:19998/unico/v1/ucenter/device-list?clientType=8`
			: `https://${host}:19998/unico/v1/ucenter/device-list`
		const resp = await got
			.get(url, {
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
	} catch (error) {
		throw new Error(`Failed to discover devices at ${host}: ${error}`)
	}
}
