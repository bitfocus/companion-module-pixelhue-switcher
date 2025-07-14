import got, { Method, OptionsOfJSONResponseBody } from 'got'

export class HttpClient {
	private host: string
	private apiPort: number
	private unicoPort: number
	private token: string | null = null

	constructor(host: string, apiPort: number, unicoPort: number = 19998) {
		this.host = host
		this.apiPort = apiPort
		this.unicoPort = unicoPort
	}

	setToken(token: string): void {
		this.token = token
	}

	private async request<T = any>(
		method: Method,
		path: string,
		options: Partial<OptionsOfJSONResponseBody> = {},
	): Promise<T> {
		const isSecure = path.startsWith('/ucenter')
		const baseUrl = isSecure ? `https://${this.host}:${this.unicoPort}` : `http://${this.host}:${this.apiPort}`

		const url = `${baseUrl}${path}`

		const headers = {
			...(this.token ? { Authorization: this.token } : {}),
			...options.headers,
		}

		const rejectUnauthorized = isSecure ? false : undefined

		return got(url, {
			method,
			...options,
			headers,
			https: {
				rejectUnauthorized,
			},
		}).json<T>()
	}

	async get<T = any>(path: string): Promise<T> {
		return this.request<T>('GET', path)
	}

	async post<T = any, B = Record<string, unknown>>(path: string, json: B): Promise<T> {
		return this.request<T>('POST', path, { json })
	}

	async put<T = any, B = Record<string, unknown>>(path: string, json: B): Promise<T> {
		return this.request<T>('PUT', path, { json })
	}
}
