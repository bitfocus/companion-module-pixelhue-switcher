import type { Preset } from '../interfaces/Preset.js'
import type { Screen } from '../interfaces/Screen.js'

function isNonEmptyTrimmedString(value: unknown): boolean {
	return typeof value === 'string' && value.trim() !== ''
}

/** 屏幕 guid、名称等关键字段为空白字符串时视为无效（设备偶发会混入占位项） */
export function isValidScreen(screen: Screen): boolean {
	return isNonEmptyTrimmedString(screen.guid) && screen.general != null && isNonEmptyTrimmedString(screen.general.name)
}

export function filterValidScreens(list: Screen[]): Screen[] {
	return list.filter(isValidScreen)
}

/** 场景 guid、名称为空白字符串时视为无效；同时净化嵌套的 screens */
export function isValidPreset(preset: Preset): boolean {
	return isNonEmptyTrimmedString(preset.guid) && isNonEmptyTrimmedString(preset.name)
}

export function filterValidPresets(list: Preset[]): Preset[] {
	return list.filter(isValidPreset).map((preset) => ({
		...preset,
		screens: filterValidScreens(preset.screens ?? []),
	}))
}
