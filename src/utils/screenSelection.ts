import type { ModuleInstance } from '../main.js'
import type { Preset } from '../interfaces/Preset.js'
import type { Screen } from '../interfaces/Screen.js'

/** 用 screenIdObj.id + type 标识屏幕，与预设里 screens 项及 self.screens 对齐 */
export function screenIdentityKey(screenIdObj: Screen['screenIdObj'] | undefined | null): string | null {
	if (screenIdObj == null) return null
	const id = Number(screenIdObj.id)
	const type = Number(screenIdObj.type)
	if (!Number.isFinite(id) || !Number.isFinite(type)) return null
	return `${id}:${type}`
}

/** 按场景涉及的屏幕更新本地选中状态 */
export function applyPresetScreenSelection(instance: ModuleInstance, preset: Preset): void {
	const selectedScreenKeys = new Set<string>()
	for (const ps of preset.screens ?? []) {
		const key = screenIdentityKey(ps?.screenIdObj)
		if (key) selectedScreenKeys.add(key)
	}
	instance.screens = instance.screens.map((screen): Screen => {
		const key = screenIdentityKey(screen.screenIdObj)
		return {
			...screen,
			select: key !== null && selectedScreenKeys.has(key) ? 1 : 0,
		}
	})
}
