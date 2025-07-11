export interface ScreenListDetailData {
	totalCount: number
	list: Screen[]
}

export type ScreenSelectionData = ScreenSelection[]

export interface ScreenSelection {
	screenId: number
	select: 0 | 1
}

export interface Screen {
	screenId: number
	general: ScreenGeneral
	select: 0 | 1
	freeze: 0 | 1
	ftb: ScreenFTB
}

export interface ScreenGeneral {
	name: string
}

export interface ScreenFTB {
	enable: 0 | 1
	time: number
}
