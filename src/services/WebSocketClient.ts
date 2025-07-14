import { WebSocket } from 'ws'
import type { ModuleInstance } from '../main.js'
import { webSocketHandlers } from '../services/WebSocketHandling.js'
import { TextDecoder } from 'util'
import { EWebsocketCallbackType, WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'

export class WebSocketClient {
	private instance: ModuleInstance
	private host: string
	private token: string
	private socket: WebSocket | null = null

	constructor(instance: ModuleInstance, host: string, token: string) {
		this.instance = instance
		this.host = host
		this.token = token
	}

	static async create(instance: ModuleInstance, host: string, token: string): Promise<WebSocketClient> {
		const client = new WebSocketClient(instance, host, token)
		client.connect()
		return client
	}

	connect(): void {
		this.disconnect()

		this.socket = new WebSocket(`wss://${this.host}:19998/unico/v1/ucenter/ws?client-type=8`, {
			headers: {
				Authorization: this.token,
			},
			rejectUnauthorized: false,
		})

		this.socket.on('message', this.messageReceived.bind(this))
		this.socket.on('error', () => this.instance.error())
		this.socket.on('close', () => this.instance.error())
	}

	disconnect(): void {
		if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
			this.socket.terminate()
		}
		this.socket = null
	}

	private messageReceived(data: WebSocket.RawData): void {
		if (!(data instanceof Buffer)) return

		const parsedMessage = this.parseTLVBuffer(Buffer.from(data))
		if (
			Object.keys(webSocketHandlers)
				.map(Number)
				.find((handlerId) => {
					return handlerId == parsedMessage.tag
				})
		) {
			webSocketHandlers[parsedMessage.tag](this.instance, parsedMessage)
		}
	}

	parseTLVBuffer(buffer: Buffer): WebsocketCallbackData {
		const TLV1_OFFSET = 32
		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

		// === TLV1 ===
		const tlv1Length = dataView.getUint16(TLV1_OFFSET + 6, true)
		const tlv1Start = TLV1_OFFSET + 8
		const tlv1End = tlv1Start + tlv1Length
		const tlv1JsonStr = new TextDecoder().decode(buffer.subarray(tlv1Start, tlv1End))
		const header = JSON.parse(tlv1JsonStr)

		// === TLV2 ===
		const tlv2Offset = tlv1End
		const tag = dataView.getUint32(tlv2Offset, true)
		const errCode = dataView.getUint16(tlv2Offset + 4, true)
		const tlv2Length = dataView.getUint16(tlv2Offset + 6, true)
		const totalLength = (errCode << 16) + tlv2Length

		const tlv2Start = tlv2Offset + 8
		const tlv2End = tlv2Start + totalLength
		const tlv2JsonStr = new TextDecoder().decode(buffer.subarray(tlv2Start, tlv2End))
		const data = JSON.parse(tlv2JsonStr || '{}')

		return {
			type: EWebsocketCallbackType.report,
			tag,
			subType: 0,
			header,
			data,
		}
	}
}
