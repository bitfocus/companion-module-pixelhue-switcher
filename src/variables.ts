import type { ModuleInstance } from './main.js'
import { CompanionVariableDefinition } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import { SCREEN_TYPE } from './interfaces/Screen.js'

export function updateCompanionVariableDefinitions(self: ModuleInstance): void {
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

	const layersVariableDefinitions = self.layers.flatMap((layer) => {
		const mvrScreen = self.screens.find((screen) => {
			return screen.screenIdObj.type === SCREEN_TYPE.MVR
		})
		const where =
			layer.layerIdObj.attachScreenId === mvrScreen?.screenId
				? 'mvr'
				: layer.layerIdObj.sceneType === LoadIn.preview
					? 'pvw'
					: 'pgm'
		const whereText = where.toUpperCase()

		let baseVariableId: string
		let baseName: string
		if (layer.layerIdObj.attachScreenId === mvrScreen?.screenId) {
			baseVariableId = `layer_${layer.serial}_${where}`
			baseName = `Layer L${layer.serial} on ${whereText}`
		} else {
			baseVariableId = `layer_${layer.serial}_${where}_screen_${layer.layerIdObj.attachScreenId}`
			baseName = `Layer L${layer.serial} on ${whereText} Screen ${layer.layerIdObj.attachScreenId}`
		}

		return [
			{
				variableId: `${baseVariableId}_x`,
				name: `${baseName}: X`,
			},
			{
				variableId: `${baseVariableId}_y`,
				name: `${baseName}: Y`,
			},
			{
				variableId: `${baseVariableId}_width`,
				name: `${baseName}: Width`,
			},
			{
				variableId: `${baseVariableId}_height`,
				name: `${baseName}: Height`,
			},
		]
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
		...layersVariableDefinitions,
	])
}
