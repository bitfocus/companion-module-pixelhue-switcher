import type { Preset } from '../interfaces/Preset.js'
import type { Screen } from '../interfaces/Screen.js'

/** Non-fusion preset nested screens may expose name at top-level; fusion uses general.name */
type ScreenLike = Screen & { name?: string }

function isNonEmptyTrimmedString(value: unknown): boolean {
	return typeof value === 'string' && value.trim() !== ''
}

function getScreenDisplayName(screen: ScreenLike): string | undefined {
	const generalName = screen.general?.name
	if (isNonEmptyTrimmedString(generalName)) return generalName
	if (isNonEmptyTrimmedString(screen.name)) return screen.name
	return undefined
}

/** Treat screens with blank guid, name, or other key fields as invalid (device may occasionally include placeholder entries) */
export function isValidScreen(screen: Screen): boolean {
	const screenLike = screen as ScreenLike
	return isNonEmptyTrimmedString(screenLike.guid) && getScreenDisplayName(screenLike) != null
}

/** Prefer general.name; if only top-level name exists (non-fusion), normalize into general.name */
function normalizeScreenNameShape(screen: Screen): Screen {
	const screenLike = screen as ScreenLike
	const displayName = getScreenDisplayName(screenLike)
	if (displayName == null || isNonEmptyTrimmedString(screen.general?.name)) {
		return screen
	}
	return {
		...screen,
		general: {
			...(screen.general ?? { name: displayName }),
			name: displayName,
		},
	}
}

export function filterValidScreens(list: Screen[]): Screen[] {
	return list.filter(isValidScreen).map(normalizeScreenNameShape)
}

/** Treat presets with blank guid or name as invalid; also sanitize nested screens */
export function isValidPreset(preset: Preset): boolean {
	return isNonEmptyTrimmedString(preset.guid) && isNonEmptyTrimmedString(preset.name)
}

export function filterValidPresets(list: Preset[]): Preset[] {
	return list.filter(isValidPreset).map((preset) => ({
		...preset,
		screens: filterValidScreens(preset.screens ?? []),
	}))
}
