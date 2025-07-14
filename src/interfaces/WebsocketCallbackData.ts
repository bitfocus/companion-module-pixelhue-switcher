export interface WebsocketCallbackData {
	type: EWebsocketCallbackType // <- report or panel
	tag: number // message type
	subType?: number
	header: Record<string, unknown>
	data: any
}

export enum EWebsocketCallbackType {
	/** Normal business report */
	report,

	/** Console panel button report */
	panel,
}
