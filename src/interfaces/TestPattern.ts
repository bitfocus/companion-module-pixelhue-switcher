export const TEST_PATTERN_TYPE_CHOICES = [
	{ value: 0, label: 'Black' },
	{ value: 1, label: 'Red' },
	{ value: 2, label: 'Green' },
	{ value: 3, label: 'Blue' },
	{ value: 4, label: 'White' },
	{ value: 5, label: 'Vertical Color Bars' },
	{ value: 6, label: 'Horizontal Color Bars' },
	{ value: 7, label: 'Checkerboard' },
	{ value: 9, label: 'Overlap Circle' },
	{ value: 256, label: 'Horizontal Red Gradient' },
	{ value: 257, label: 'Horizontal Green Gradient' },
	{ value: 258, label: 'Horizontal Blue Gradient' },
	{ value: 259, label: 'Horizontal White Gradient' },
	{ value: 260, label: 'Vertical Red Gradient' },
	{ value: 261, label: 'Vertical Green Gradient' },
	{ value: 262, label: 'Vertical Blue Gradient' },
	{ value: 263, label: 'Vertical White Gradient' },
	{ value: 512, label: 'Horizontal Lines' },
	{ value: 513, label: 'Vertical Lines' },
	{ value: 514, label: 'White diagonal Left' },
	{ value: 515, label: 'White diagonal Right' },
	{ value: 516, label: 'Grid' },
	{ value: 517, label: 'Crossed Diagonals' },
	{ value: 518, label: 'Overlap Color' },
] as const

export const SCREEN_TEST_PATTERN_TYPE_CHOICES = [
	{ value: 519, label: 'Circle Alignment (Checkerboard Full Screen)' },
	{ value: 520, label: 'SMPTE' },
	{ value: 521, label: 'Circle Alignment (Grid Full Screen)' },
] as const

/**
 * Speed level choices for test pattern
 * 5 levels: 0-Still, 1-Slow, 2-Medium, 3-Fast, 4-Extremely Fast
 */
export const SPEED_LEVEL_CHOICES = [
	{ value: 0, label: '0' }, // Still
	{ value: 1, label: '1' }, // Slow
	{ value: 2, label: '2' }, // Medium
	{ value: 3, label: '3' }, // Fast
	{ value: 4, label: '4' }, // Extremely Fast
] as const

export type TestPatternValue =
	| (typeof TEST_PATTERN_TYPE_CHOICES)[number]['value']
	| (typeof SCREEN_TEST_PATTERN_TYPE_CHOICES)[number]['value']

export enum TestPatternGridType {
	Density = 0,
	Spacing = 1,
}

export interface TestPatternPayload {
	enable: 0 | 1
	type: TestPatternValue
	bright: number
	grid: number
	gridType: TestPatternGridType
	gridLineWidth: number
	speed: number
	verticalSpace: number
	verticalGrid: number
	horizontalSpace: number
	screenBorder: number
	interfaceBorder: number
	position: number
}
