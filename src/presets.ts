import type { ModuleInstance } from './main.js'
import { getControlPresetDefinitions } from './presets/ControlDefinitions.js'
import { getDisplatPresetDefinitions } from './presets/DisplayDefinitions.js'
import { getLayerDefinitions } from './presets/LayersDefinitions.js'
import { getPresetsPresetDefinitions } from './presets/PresetDefinitions.js'
import { getScreenPresetDefinitions } from './presets/ScreenDefinitions.js'

export function updateCompanionPresets(self: ModuleInstance): void {
	self.setPresetDefinitions({
		...getPresetsPresetDefinitions(self),
		...getScreenPresetDefinitions(self),
		...getControlPresetDefinitions(self),
		...getDisplatPresetDefinitions(),
		...getLayerDefinitions(),
	})
}
