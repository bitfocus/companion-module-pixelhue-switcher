export interface PresetListDetailData {
	totalCount: number
	list: Preset[]
}

export interface Preset {
	presetId: number
	general: PresetGeneral
	presetIdObj: PresetIdObject
	keyPosition: number[]
}
export interface PresetIdObject {
	sceneType: number
	playType: number
}

export interface PresetGeneral {
	name: string
}

export const LoadIn = {
	preview: 4,
	program: 2,
}
