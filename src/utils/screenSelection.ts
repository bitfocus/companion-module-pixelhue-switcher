import type { ModuleInstance } from '../main.js'
import type { Preset } from '../interfaces/Preset.js'
import type { Screen } from '../interfaces/Screen.js'

/** Identify screens by screenIdObj.id + type, aligned with preset screen entries and self.screens */
export function screenIdentityKey(screenIdObj: Screen['screenIdObj'] | undefined | null): string | null {
	if (screenIdObj == null) return null
	const id = Number(screenIdObj.id)
	const type = Number(screenIdObj.type)
	if (!Number.isFinite(id) || !Number.isFinite(type)) return null
	return `${id}:${type}`
}

/** Update local selection state based on screens involved in the preset */
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
