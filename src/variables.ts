import type { ModuleInstance } from './main.js'
import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import { SCREEN_TYPE } from './interfaces/Screen.js'
import { Layer } from './interfaces/Layer.js'

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
		const baseVariableId = getLayerVariableId(self, layer)
		const baseName = getLayerVariableName(self, layer)

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
			{
				variableId: `${baseVariableId}_source`,
				name: `${baseName}: Source`,
			},
		]
	})

	self.setVariableDefinitions([
		{ variableId: 'global_load_in', name: 'Global Preset Load In' },
		{ variableId: 'global_load_in_short', name: 'Global Preset Load In (Short Name)' },
		{ variableId: 'global_load_in_program', name: 'Global Preset Load In (Program)' },
		{ variableId: 'global_load_in_preview', name: 'Global Preset Load In (Preview)' },
		{ variableId: 'take_action', name: 'Take Action (Swap/Copy)' },
		{ variableId: 'selected_layer', name: `Selected Layer ID` },
		{ variableId: 'selected_layer_name', name: `Selected Layer: Name` },
		{ variableId: 'selected_layer_x', name: 'Selected Layer: X' },
		{ variableId: 'selected_layer_y', name: 'Selected Layer: Y' },
		{ variableId: 'selected_layer_height', name: 'Selected Layer: Height' },
		{ variableId: 'selected_layer_width', name: 'Selected Layer: Width' },
		...presetVariableDefinitions,
		...screensNameVariableDefinitions,
		...screensFreezeVariableDefinitions,
		...screensFtbVariableDefinitions,
		...layersVariableDefinitions,
	])
}

export function updateVariableValues(self: ModuleInstance): void {
	const presetVariables: CompanionVariableValues = {}
	self.presets.forEach((preset) => {
		presetVariables[`preset_${preset.keyPosition[0]}_name`] = preset.general.name
	})

	const screenVariables: CompanionVariableValues = {}
	self.screens.forEach((screen) => {
		screenVariables[`screen_${screen.screenId}_name`] = screen.general.name
		screenVariables[`screen_${screen.screenId}_freeze`] = screen.freeze === 1
		screenVariables[`screen_${screen.screenId}_ftb`] = screen.ftb.enable === 1
	})

	const layerVariables: CompanionVariableValues = {}
	self.layers.forEach((layer) => {
		const baseVariableId = getLayerVariableId(self, layer)

		layerVariables[`${baseVariableId}_x`] = layer.window.x
		layerVariables[`${baseVariableId}_y`] = layer.window.y
		layerVariables[`${baseVariableId}_width`] = layer.window.width
		layerVariables[`${baseVariableId}_height`] = layer.window.height
		layerVariables[`${baseVariableId}_source`] = layer.source.general.sourceName
	})

	const selectedLayer = self.layers.find((layer) => {
		return layer.selected === 1
	})

	self.setVariableValues({
		global_load_in: self.globalLoadPresetIn === LoadIn.preview ? 'Preview' : 'Program',
		global_load_in_short: self.globalLoadPresetIn === LoadIn.preview ? 'PVW' : 'PGM',
		global_load_in_program: self.globalLoadPresetIn === LoadIn.program,
		global_load_in_preview: self.globalLoadPresetIn === LoadIn.preview,
		take_action: self.swapEnabled ? 'Swap' : 'Copy',
		selected_layer: selectedLayer?.layerId,
		selected_layer_name: selectedLayer?.general.name,
		selected_layer_x: selectedLayer?.window.x,
		selected_layer_y: selectedLayer?.window.y,
		selected_layer_height: selectedLayer?.window.height,
		selected_layer_width: selectedLayer?.window.width,
		...presetVariables,
		...screenVariables,
		...layerVariables,
	})
}

function getLayerVariableId(self: ModuleInstance, layer: Layer): string {
	const screen = self.screens.find((screen) => {
		return screen.screenId === layer.layerIdObj.attachScreenId
	})
	const where =
		screen?.screenIdObj.type === SCREEN_TYPE.MVR
			? screen.general.name.replaceAll(' ', '').toLowerCase()
			: layer.layerIdObj.sceneType === LoadIn.preview
				? 'pvw'
				: 'pgm'
	if (screen?.screenIdObj.type === SCREEN_TYPE.MVR) {
		return `${where}_layer_${layer.layerId}`
	} else {
		return `${where}_screen_${layer.layerIdObj.attachScreenId}_layer_${layer.serial}`
	}
}

function getLayerVariableName(self: ModuleInstance, layer: Layer): string {
	const screen = self.screens.find((screen) => {
		return screen.screenId === layer.layerIdObj.attachScreenId
	})
	const where =
		screen?.screenIdObj.type === SCREEN_TYPE.MVR
			? screen.general.name
			: layer.layerIdObj.sceneType === LoadIn.preview
				? 'PVW'
				: 'PGM'
	if (screen?.screenIdObj.type === SCREEN_TYPE.MVR) {
		return `Layer ${layer.layerId} on ${where}`
	} else {
		return `Layer L${layer.serial} on ${where} Screen ${layer.layerIdObj.attachScreenId}`
	}
}
