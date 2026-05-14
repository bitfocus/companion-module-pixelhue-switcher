export interface CropSourcesListDetailData {
	list: CropSource[]
	count: number
	page: number
	totalCount: number
	totalPage: number
}

export interface CropSource {
	cropId: number
	cropIdObj: CropIdObj
	name: string
	crop: Crop
	keyPosition: number[]
}

export interface CropIdObj {
	sourceId: number
	sourceType: number
	id: number
}

export interface Crop {
	xRatio: number
	yRatio: number
	widthRatio: number
	heightRatio: number
}
