import { WebSocket } from 'ws'
import type { ModuleInstance } from '../main.js'
import { webSocketHandlers } from '../services/WebSocketHandling.js'
import { TextDecoder } from 'util'
import { EWebsocketCallbackType, WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'
import { isMessageForThisDevice } from '../utils/websocketFilter.js'

export class WebSocketClient {
	private instance: ModuleInstance
	private host: string
	private token: string
	private socket: WebSocket | null = null
	private intentionalDisconnect = false
	private disconnectNotified = false

	private readonly onMessage = (data: WebSocket.RawData) => this.messageReceived(data)
	private readonly onRuntimeError = () => this.notifyDisconnect()
	private readonly onRuntimeClose = () => this.notifyDisconnect()

	private decoder = new TextDecoder()

	constructor(instance: ModuleInstance, host: string, token: string) {
		this.instance = instance
		this.host = host
		this.token = token
	}

	static async create(instance: ModuleInstance, host: string, token: string): Promise<WebSocketClient> {
		const client = new WebSocketClient(instance, host, token)
		await client.connect()
		return client
	}

	async connect(): Promise<void> {
		this.intentionalDisconnect = false
		this.disconnectNotified = false

		await new Promise<void>((resolve, reject) => {
			const socket = new WebSocket(`wss://${this.host}:19998/unico/v1/ucenter/ws?client-type=8`, {
				headers: {
					Authorization: this.token,
				},
				rejectUnauthorized: false,
			})
			this.socket = socket

			const cleanupInitial = () => {
				socket.off('open', onOpen)
				socket.off('error', onInitialError)
				socket.off('close', onInitialClose)
			}

			const onOpen = () => {
				cleanupInitial()
				socket.on('message', this.onMessage)
				socket.on('error', this.onRuntimeError)
				socket.on('close', this.onRuntimeClose)
				resolve()
			}

			const onInitialError = (error: Error) => {
				cleanupInitial()
				this.socket = null
				reject(error instanceof Error ? error : new Error(String(error)))
			}

			const onInitialClose = () => {
				cleanupInitial()
				this.socket = null
				reject(new Error('WebSocket closed before open'))
			}

			socket.once('open', onOpen)
			socket.once('error', onInitialError)
			socket.once('close', onInitialClose)
		})
	}

	private notifyDisconnect(): void {
		if (this.intentionalDisconnect || this.disconnectNotified) return

		this.disconnectNotified = true
		if (this.socket) {
			this.socket.off('message', this.onMessage)
			this.socket.off('error', this.onRuntimeError)
			this.socket.off('close', this.onRuntimeClose)
		}
		this.socket = null
		this.instance.handleWebSocketDisconnect()
	}

	disconnect(): void {
		this.intentionalDisconnect = true
		if (this.socket) {
			this.socket.off('message', this.onMessage)
			this.socket.off('error', this.onRuntimeError)
			this.socket.off('close', this.onRuntimeClose)

			if (this.socket.readyState !== WebSocket.CLOSED) {
				this.socket.terminate()
			}
		}
		this.socket = null
	}

	private messageReceived(data: WebSocket.RawData): void {
		if (!(data instanceof Buffer)) return

		const parsedMessage = this.parseTLVBuffer(Buffer.from(data))
		//this.instance.log('info', `WebSocket message received: ${JSON.stringify(parsedMessage)}`)

		const handlerId = Object.keys(webSocketHandlers)
			.map(Number)
			.find((id) => id == parsedMessage.tag)

		if (handlerId == null) return

		if (!isMessageForThisDevice(this.instance, parsedMessage)) {
			return
		}

		this.instance.log('info', `WebSocket message received: ${JSON.stringify(parsedMessage)}`)
		webSocketHandlers[parsedMessage.tag](this.instance, parsedMessage)
	}

	parseTLVBuffer(buffer: Buffer): WebsocketCallbackData {
		const TLV1_OFFSET = 32
		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

		// === TLV1 ===
		const tlv1Length = dataView.getUint16(TLV1_OFFSET + 6, true)
		const tlv1Start = TLV1_OFFSET + 8
		const tlv1End = tlv1Start + tlv1Length
		const tlv1JsonStr = this.decoder.decode(buffer.subarray(tlv1Start, tlv1End))
		const header = JSON.parse(tlv1JsonStr)

		// === TLV2 ===
		const tlv2Offset = tlv1End
		const tag = dataView.getUint32(tlv2Offset, true)
		const errCode = dataView.getUint16(tlv2Offset + 4, true)
		const tlv2Length = dataView.getUint16(tlv2Offset + 6, true)
		const totalLength = (errCode << 16) + tlv2Length

		const tlv2Start = tlv2Offset + 8
		const tlv2End = tlv2Start + totalLength
		const tlv2JsonStr = this.decoder.decode(buffer.subarray(tlv2Start, tlv2End))
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
