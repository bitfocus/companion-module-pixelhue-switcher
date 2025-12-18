import type { ModuleInstance } from './main.js'
import { getControlPresetDefinitions } from './presets/ControlDefinitions.js'
import { getDisplayPresetDefinitions } from './presets/DisplayDefinitions.js'
import { getLayerDefinitions } from './presets/LayersDefinitions.js'
import { getPresetsPresetDefinitions } from './presets/PresetDefinitions.js'
import { getScreenPresetDefinitions } from './presets/ScreenDefinitions.js'
import { getBackupDefinitions } from './presets/BackupsDefinitions.js'

export function updateCompanionPresets(self: ModuleInstance): void {
	self.setPresetDefinitions({
		...getPresetsPresetDefinitions(self),
		...getScreenPresetDefinitions(self),
		...getControlPresetDefinitions(self),
		...getDisplayPresetDefinitions(),
		...getLayerDefinitions(),
		...getBackupDefinitions(self),
	})
}
