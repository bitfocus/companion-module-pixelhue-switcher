export interface LayerPresetListDetailData {
	totalCount: number
	list: LayerPreset[]
}

export interface LayerPreset {
	layerPresetId: number
	general: LayerPresetGeneral
}

export interface LayerPresetGeneral {
	name: string
	labelColor: LayerPresetLabelColor
}

interface LayerPresetLabelColor {
	R: number
	G: number
	B: number
}
