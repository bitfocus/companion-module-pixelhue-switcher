import jwt from 'jsonwebtoken'
import * as console from 'node:console'

export const generateToken = (sn: string, secret: string): string => {
	return jwt.sign(sn, secret, {
		algorithm: 'HS256',
	})
}

export interface ParsedMessage {
	type: number
	subType: number
	data: any
}

export const parseWebsocketMessage = (message: Buffer): ParsedMessage => {
	// Skip Header
	message = message.subarray(16)
	// Find first JSON location
	const startOfFirstJson = message.indexOf(Uint8Array.from([0x01, 0x21, 0x10])) + 8
	const firstJsonLengthIndex = message.indexOf(Uint8Array.from([0x01, 0x21, 0x10])) + 6
	const firstJsonLength = message
		.subarray(firstJsonLengthIndex, firstJsonLengthIndex + 2)
		.reverse()
		.readUInt16BE()
	// Find second JSON location
	const messageType = message.subarray(startOfFirstJson + firstJsonLength, startOfFirstJson + firstJsonLength + 2)
	const messageSubType = message.subarray(
		startOfFirstJson + firstJsonLength + 2,
		startOfFirstJson + firstJsonLength + 3,
	)
	console.log(messageType)
	message = message.subarray(startOfFirstJson + firstJsonLength + 8)
	return {
		type: messageType.readUInt16BE(),
		subType: messageSubType.readUint8(),
		data: JSON.parse(message.toString()),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function realMerge(to: any, from: any): any {
	for (const n in from) {
		if (typeof to[n] != 'object') {
			to[n] = from[n]
		} else if (typeof from[n] == 'object') {
			to[n] = realMerge(to[n], from[n])
		}
	}
	return to
}
