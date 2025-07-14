import { ModuleInstance } from '../main.js'
import { LayerSelection } from '../interfaces/Layer.js'
import { Screen, ScreenListDetailData, ScreenSelectionData } from '../interfaces/Screen.js'
import { Preset, PresetListDetailData } from '../interfaces/Preset.js'
import { WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'
import { realMerge } from '../utils/utils.js'

export const MessageTypes = {
	layersSelected: 0x81105,
	screensUpdated: 0x61100,
	screenNamesChanged: 0x71102,
	screensSelected: 0x71111,
	presetsUpdated: 0xa2100,
	presetNamesChanged: 0xa2105,
	swapUpdated: 0x71201,
	presetCreated: 0xa2101,
	selectedScreenFreeze: 0x71207,
	selectedScreenFtb: 0x71206,
	freezeChanged: 0x71113,
	ftbChanged: 0x71114,
	createScreen: 0x7111f,
}

export const webSocketHandlers: { [key: number]: (self: ModuleInstance, message: WebsocketCallbackData) => void } = {
	[MessageTypes.layersSelected]: layersSelected,
	//[MessageTypes.screensUpdated]: screensUpdated,
	[MessageTypes.screenNamesChanged]: screenPropertiesChanged,
	[MessageTypes.freezeChanged]: screenPropertiesChanged,
	[MessageTypes.ftbChanged]: screenPropertiesChanged,
	[MessageTypes.screensSelected]: screensSelected,
	[MessageTypes.presetsUpdated]: presetsUpdated,
	[MessageTypes.presetNamesChanged]: presetNamesChanged,
	[MessageTypes.swapUpdated]: swapUpdated,
	[MessageTypes.presetCreated]: presetCreated,
}

export function layersSelected(self: ModuleInstance, message: WebsocketCallbackData): void {
	const layerSelections: LayerSelection[] = message.data
	layerSelections.forEach((layerSelection: LayerSelection) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === layerSelection.layerId
		})!

		layer.selected = layerSelection.selected
	})
}

export function screensUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const screenResponse: ScreenListDetailData = message.data
	updateScreens(self, screenResponse.list)
}

export function screenPropertiesChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	const screens: Screen[] = message.data
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

export function screensSelected(self: ModuleInstance, message: WebsocketCallbackData): void {
	const screenSelectionData: ScreenSelectionData = message.data
	screenSelectionData.forEach((screenSelection) => {
		const screen = self.screens.find((oldScreen) => {
			return oldScreen.screenId === screenSelection.screenId
		})!
		screen.select = screenSelection.select
	})
	self.checkFeedbacks('screenState')
}

export function presetsUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const presetsResponse: PresetListDetailData = message.data
	updatePresets(self, presetsResponse.list)
}

export function presetNamesChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	const presets: Preset[] = message.data
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

export function swapUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.swapEnabled = message.data.enable === 1
	self.setVariableValues({
		take_action: self.swapEnabled ? 'Swap' : 'Copy',
	})
	self.checkFeedbacks('swapState')
}

export function presetCreated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const presets: Preset[] = message.data
	self.presets.push(...presets)
	self.updateVariableDefinitions()
	self.updateVariableValues()
}

export function globalFtbChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.globalFtb = message.data.ftb.enable
	self.checkFeedbacks('globalFtbState')
}

export function globalFreezeChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.globalFreeze = message.data.freeze
	self.checkFeedbacks('globalFreezeState')
}
