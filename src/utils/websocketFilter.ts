import type { ModuleInstance } from '../main.js'
import type { WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'

/** ucenter WebSocket broadcasts to all connections on the same host; use header.sn to handle only this module's bound device */
export function isMessageForThisDevice(self: ModuleInstance, message: WebsocketCallbackData): boolean {
	const boundSn = self.deviceSn
	if (!boundSn) return true

	const rawSn = (message.header?.sn ?? message.header?.SN) as string
	if (rawSn == null || String(rawSn).trim() === '') return false

	return String(rawSn) === boundSn
}
