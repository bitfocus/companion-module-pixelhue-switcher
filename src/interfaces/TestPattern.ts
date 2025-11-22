export const TEST_PATTERN_TYPE_CHOICES = [
	{ id: 0x0000, label: 'Black' },
	{ id: 0x0001, label: 'Red' },
	{ id: 0x0002, label: 'Green' },
	{ id: 0x0003, label: 'Blue' },
	{ id: 0x0004, label: 'White' },
	{ id: 0x0005, label: 'Vertical stripes' },
	{ id: 0x0006, label: 'Horizontal stripes' },
	{ id: 0x0007, label: 'Checkerboard' },
	{ id: 0x0100, label: 'Horizontal red gradient' },
	{ id: 0x0101, label: 'Horizontal green gradient' },
	{ id: 0x0102, label: 'Horizontal blue gradient' },
	{ id: 0x0103, label: 'Horizontal white gradient' },
	{ id: 0x0104, label: 'Vertical red gradient' },
	{ id: 0x0105, label: 'Vertical green gradient' },
	{ id: 0x0106, label: 'Vertical blue gradient' },
	{ id: 0x0107, label: 'Vertical white gradient' },
	{ id: 0x0200, label: 'Horizontal white lines' },
	{ id: 0x0201, label: 'Vertical white lines' },
	{ id: 0x0202, label: 'White diagonal left' },
	{ id: 0x0203, label: 'White diagonal right' },
	{ id: 0x0204, label: 'Crossed lines' },
	{ id: 0x0205, label: 'Crossed diagonals' },
	{ id: 0x0300, label: 'Locate' },
	{ id: 0xfffe, label: 'Custom test pattern' },
	{ id: 0xffff, label: 'Off' },
] as const

export type TestPatternType = (typeof TEST_PATTERN_TYPE_CHOICES)[number]['id']

export enum TestPatternGridType {
	Density = 0,
	Spacing = 1,
}

export interface TestPatternPayload {
	enable: 0 | 1
	type: TestPatternType
	bright: number
	grid: number
	gridType: TestPatternGridType
	gridLineWidth: number
	speed: number
}
