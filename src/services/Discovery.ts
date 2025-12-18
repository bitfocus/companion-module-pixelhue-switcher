import got from 'got'

export interface DiscoveredDevice {
	SN: string
	modelId: number
	deviceName: string
	ip: string
	protocols: Array<{ linkType: string; port: number }>
}

export async function discoverDevices(host: string): Promise<DiscoveredDevice[]> {
	try {
		const resp = await got
			.get(`https://${host}:19998/unico/v1/ucenter/device-list`, {
				https: {
					rejectUnauthorized: false, // allow self-signed cert
				},
				timeout: {
					request: 5000,
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
