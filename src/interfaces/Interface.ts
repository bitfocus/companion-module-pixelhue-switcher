export interface InterfacesListDetailData {
	totalCount: number
	list: Interface[]
}

export interface Interface {
	auxiliaryInfo: InterfaceAuxiliaryInfo
	general: InterfaceGeneral
	interfaceId: number
	state: 0 | 1
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
