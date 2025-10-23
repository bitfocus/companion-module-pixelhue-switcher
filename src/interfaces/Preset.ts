import { Screen } from './Screen.js'

export interface PresetListDetailData {
	totalCount: number
	list: Preset[]
}

export interface Preset {
	guid: string
	name: string
	currentRegion: number
	sourceRegion: number
	serial: number
	screens: Screen[]
}

export interface PresetGeneral {
	name: string
}

export const LoadIn = {
	preview: 4,
	program: 2,
}
