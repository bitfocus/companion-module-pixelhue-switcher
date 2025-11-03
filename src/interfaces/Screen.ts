import { Layer } from './Layer.js'

export interface ScreenListDetailData {
	totalCount: number
	list: Screen[]
}

export interface UpdateLayoutData {
	selectScreens: Screen[]
	deleteLayers: Layer[]
	createLayers: Layer[]
}

export type ScreenSelectionData = ScreenSelection[]

export interface ScreenSelection {
	screenId: number
	select: 0 | 1
}

export interface Screen {
	screenId: number
	screenIdObj: ScreenIdObj
	general: ScreenGeneral
	select: 0 | 1
	freeze: 0 | 1
	enable: 0 | 1
	guid: string
	ftb: ScreenFTB
}

export interface ScreenGeneral {
	name: string
}

export interface ScreenFTB {
	enable: 0 | 1
	time: number
}

export interface ScreenIdObj {
	id: number
	type: number
}

export const SCREEN_TYPE = {
	SCREEN: 2,
	AUX: 4,
	MVR: 8,
}
