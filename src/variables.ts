import type { ModuleInstance } from './main.js'
import { CompanionVariableDefinition } from '@companion-module/base'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const presetVariableDefinitions: CompanionVariableDefinition[] = self.presets.map((preset) => {
		return {
			variableId: `preset_${preset.keyPosition[0]}_name`,
			name: `Preset ${preset.keyPosition[0]}: Name`,
		}
	})

	const screensNameVariableDefinitions: CompanionVariableDefinition[] = self.screens.map((screen) => {
		return {
			variableId: `screen_${screen.screenId}_name`,
			name: `Screen "${screen.general.name}": Name`,
		}
	})

	const screensFreezeVariableDefinitions = self.screens.map((screen) => {
		return {
			variableId: `screen_${screen.screenId}_freeze`,
			name: `Screen "${screen.general.name}": Freeze`,
		}
	})

	const screensFtbVariableDefinitions = self.screens.map((screen) => {
		return {
			variableId: `screen_${screen.screenId}_ftb`,
			name: `Screen "${screen.general.name}": FTB`,
		}
	})

	self.setVariableDefinitions([
		{ variableId: 'global_load_in', name: 'Global Preset Load In' },
		{ variableId: 'global_load_in_short', name: 'Global Preset Load In (Short Name)' },
		{ variableId: 'global_load_in_program', name: 'Global Preset Load In (Program)' },
		{ variableId: 'global_load_in_preview', name: 'Global Preset Load In (Preview)' },
		{ variableId: 'take_action', name: 'Take Action (Swap/Copy)' },
		...presetVariableDefinitions,
		...screensNameVariableDefinitions,
		...screensFreezeVariableDefinitions,
		...screensFtbVariableDefinitions,
	])
}
