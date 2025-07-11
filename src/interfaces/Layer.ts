export interface LayerListDetailData {
	totalCount: number
	list: Layer[]
}

export interface LayerSelection {
	layerId: number
	selected: 0 | 1
}

export interface Layer {
	layerId: number
	general: LayerGeneral
	selected: 0 | 1
	layerIdObj: LayerIdObj
}

export interface LayerIdObj {
	attachScreenId: number
	sceneType: number
}

export interface LayerGeneral {
	name: string
}
