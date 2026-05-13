export interface InterfacesListDetailData {
	totalCount: number
	list: Interface[]
}

export interface Interface {
	auxiliaryInfo: InterfaceAuxiliaryInfo
	general: InterfaceGeneral
	interfaceId: number
	state: number
	linkInfo: LinkInfo
}

export interface InterfaceGeneral {
	name: string
}

export interface InterfaceAuxiliaryInfo {
	connectorInfo: InterfaceAuxiliaryInfoConnectorInfo
}

export interface InterfaceAuxiliaryInfoConnectorInfo {
	interfaceType: number
	type: number
	workMode: number
}

export interface LinkInfo {
	isLink: 0 | 1
	shared?: number
	sourceInfo?: SourceInfo
}

export interface SourceInfo {
	identify: string
	sourceId: number
	sourceType: number
}
