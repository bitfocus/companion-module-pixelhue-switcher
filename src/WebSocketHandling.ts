import { ModuleInstance } from './main.js'
import { ParsedMessage, realMerge } from './utils.js'
import { LayerSelection } from './interfaces/Layer.js'
import { Screen, ScreenListDetailData, ScreenSelectionData } from './interfaces/Screen.js'
import { Preset, PresetListDetailData } from './interfaces/Preset.js'

export const MessageTypes = {
	layersSelected: 0x0511,
	screensUpdated: 0x0721,
	screenNamesChanged: 0x0211,
	screensSelected: 0x1111,
	presetsUpdated: 0x0021,
	presetNamesChanged: 0x0521,
	swapUpdated: 0x0112,
	presetCreated: 0x0121,
	freezeChanged: 0x1311,
	ftbChanged: 0x1411,
	globalFtbChanged: 0x0612,
	globalFreezeChanged: 0x0712,
}

export const webSocketHandlers: { [key: number]: (self: ModuleInstance, parsedMessage: ParsedMessage) => void } = {
	[MessageTypes.layersSelected]: layersSelected,
	[MessageTypes.screensUpdated]: screensUpdated,
	[MessageTypes.screenNamesChanged]: screenPropertiesChanged,
	[MessageTypes.freezeChanged]: screenPropertiesChanged,
	[MessageTypes.ftbChanged]: screenPropertiesChanged,
	[MessageTypes.screensSelected]: screensSelected,
	[MessageTypes.presetsUpdated]: presetsUpdated,
	[MessageTypes.presetNamesChanged]: presetNamesChanged,
	[MessageTypes.swapUpdated]: swapUpdated,
	[MessageTypes.presetCreated]: presetCreated,
	[MessageTypes.globalFtbChanged]: globalFtbChanged,
	[MessageTypes.globalFreezeChanged]: globalFreezeChanged,
}

export function layersSelected(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const layerSelections: LayerSelection[] = parsedMessage.data
	layerSelections.forEach((layerSelection: LayerSelection) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === layerSelection.layerId
		})!

		layer.selected = layerSelection.selected
	})
}

export function screensUpdated(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const screenResponse: ScreenListDetailData = parsedMessage.data
	updateScreens(self, screenResponse.list)
}

export function screenPropertiesChanged(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const screens: Screen[] = parsedMessage.data
	updateScreens(self, screens)
	self.updateVariableValues()
}

export function updateScreens(self: ModuleInstance, screens: Screen[]): void {
	screens.forEach((screen) => {
		const newScreen = self.screens.find((oldScreen) => {
			return oldScreen.screenId === screen.screenId
		})
		if (!newScreen) return
		realMerge(newScreen, screen)
	})
	self.checkFeedbacks('screenState', 'screenFreezeState', 'screenFtbState')
}

export function screensSelected(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const screenSelectionData: ScreenSelectionData = parsedMessage.data
	screenSelectionData.forEach((screenSelection) => {
		const screen = self.screens.find((oldScreen) => {
			return oldScreen.screenId === screenSelection.screenId
		})!
		screen.select = screenSelection.select
	})
	self.checkFeedbacks('screenState')
}

export function presetsUpdated(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	if (parsedMessage.subType !== 0x0a) return

	const presetsResponse: PresetListDetailData = parsedMessage.data
	updatePresets(self, presetsResponse.list)
}

export function presetNamesChanged(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const presets: Preset[] = parsedMessage.data
	console.log(parsedMessage.data)
	updatePresets(self, presets)
}

export function updatePresets(self: ModuleInstance, presets: Preset[]): void {
	presets.forEach((preset) => {
		const newPreset = self.presets.find((oldPreset: Preset) => {
			return oldPreset.presetId === preset.presetId
		})!
		if (!newPreset) return
		realMerge(newPreset, preset)
	})

	self.checkFeedbacks('presetState')
	self.updateVariableValues()
	self.updatePresets()
}

export function swapUpdated(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	self.swapEnabled = parsedMessage.data.enable === 1
	self.setVariableValues({
		take_action: self.swapEnabled ? 'Swap' : 'Copy',
	})
	self.checkFeedbacks('swapState')
}

export function presetCreated(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	const presets: Preset[] = parsedMessage.data
	self.presets.push(...presets)
	self.updateVariableDefinitions()
	self.updateVariableValues()
}

export function globalFtbChanged(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	self.globalFtb = parsedMessage.data.ftb.enable
	self.checkFeedbacks('globalFtbState')
}

export function globalFreezeChanged(self: ModuleInstance, parsedMessage: ParsedMessage): void {
	self.globalFreeze = parsedMessage.data.freeze
	self.checkFeedbacks('globalFreezeState')
}
