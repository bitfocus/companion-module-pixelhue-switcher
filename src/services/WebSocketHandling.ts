import { ModuleInstance } from '../main.js'
import { Layer, LayerSelection } from '../interfaces/Layer.js'
import { Screen, ScreenSelectionData, UpdateLayoutData } from '../interfaces/Screen.js'
import { Preset, PresetListDetailData } from '../interfaces/Preset.js'
import { WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'
import { realMerge } from '../utils/utils.js'
import { SourceBackup } from '../interfaces/SourceBackup.js'

export const MessageTypes = {
	layersSelected: 0x81105,
	screensUpdated: 0x61100,
	screenNamesChanged: 0x71102,
	screensSelected: 0x71111,
	presetNamesChanged: 0xa2105,
	presetCreated: 0xa2101,
	selectedScreenFreeze: 0x71113,
	selectedScreenFtb: 0x71114,
	globalFtbChanged: 0x71206,
	globalFreezeChanged: 0x71207,
	createScreen: 0x7111f,
	layerPresetCreated: 0x81302,
	layoutUpdated: 0xa2107,
	layerMoved: 0x8110b,
	umdUpdated: 0x81113,
	layerGeneralUpdated: 0x81109,
	presetApplied: 0xa2100,
	sourceBackupUpdated: 0x4050d,
	presetDeleted: 0xa2106,
}

export const webSocketHandlers: { [key: number]: (self: ModuleInstance, message: WebsocketCallbackData) => void } = {
	[MessageTypes.layersSelected]: layersSelected,
	[MessageTypes.screenNamesChanged]: screenPropertiesChanged,
	[MessageTypes.selectedScreenFreeze]: screenPropertiesChanged,
	[MessageTypes.selectedScreenFtb]: screenPropertiesChanged,
	[MessageTypes.screensSelected]: screensSelected,
	[MessageTypes.presetNamesChanged]: presetNamesChanged,
	[MessageTypes.presetCreated]: presetCreated,
	[MessageTypes.globalFreezeChanged]: globalFreezeChanged,
	[MessageTypes.globalFtbChanged]: globalFtbChanged,
	[MessageTypes.layerPresetCreated]: layerPresetCreated,
	[MessageTypes.layoutUpdated]: layoutUpdated,
	[MessageTypes.layerMoved]: layerMoved,
	[MessageTypes.umdUpdated]: umdUpdated,
	[MessageTypes.layerGeneralUpdated]: layerGeneralUpdated,
	[MessageTypes.presetApplied]: presetApplied,
	[MessageTypes.sourceBackupUpdated]: sourceBackupUpdated,
	[MessageTypes.presetDeleted]: presetDeleted,
}

export function layersSelected(self: ModuleInstance, message: WebsocketCallbackData): void {
	const layerSelections: LayerSelection[] = message.data
	layerSelections.forEach((layerSelection: LayerSelection) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === layerSelection.layerId
		})

		if (!layer) return

		layer.selected = layerSelection.selected
	})

	self.updateVariableValues()
	self.checkFeedbacks('selectedLayerState')
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
			return oldPreset.guid === preset.guid
		})!
		if (!newPreset) return
		realMerge(newPreset, preset)
	})

	self.checkFeedbacks('presetState')
	self.updateVariableValues()
	self.updatePresets()
}

export function presetCreated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const newPreset: Preset = message.data
	self.presets = self.presets.filter((preset) => preset.serial !== newPreset.serial)
	self.presets.push(newPreset)
	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
}

export function presetDeleted(self: ModuleInstance, message: WebsocketCallbackData): void {
	const index = self.presets.findIndex((preset) => preset.guid === String(message.data))

	if (index !== -1) {
		self.presets.splice(index, 1)
	}

	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
}

export function globalFtbChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.globalFtb = message.data.ftb.enable
	self.checkFeedbacks('globalFtbState')
}

export function globalFreezeChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.globalFreeze = message.data.freeze
	self.checkFeedbacks('globalFreezeState')
}

export function layerPresetCreated(self: ModuleInstance, message: WebsocketCallbackData): void {
	self.layerPresets.push(...message.data)
}

export function layoutUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const data: UpdateLayoutData = message.data

	data.deleteLayers.forEach((layerToDelete) => {
		const index = self.layers.findIndex((layer) => {
			return layer.layerId === layerToDelete.layerId
		})

		if (index > -1) {
			self.layers.splice(index, 1)
		}
	})

	self.layers.push(...data.createLayers)
}

export function layerMoved(self: ModuleInstance, message: WebsocketCallbackData): void {
	const newLayerBounds: Layer[] = message.data
	newLayerBounds.forEach((newLayerBound) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === newLayerBound.layerId
		})

		if (!layer) return

		layer.window = newLayerBound.window
	})

	self.updateVariableValues()
}

export function umdUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const newLayersUMD: any[] = message.data
	newLayersUMD.forEach((newLayerUMD) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === newLayerUMD.layerId
		})

		if (!layer) return

		layer.UMD = newLayerUMD.umd
	})

	self.updateVariableValues()
}

export function layerGeneralUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const newLayersGeneral: any[] = message.data
	newLayersGeneral.forEach((newLayerGeneral) => {
		const layer = self.layers.find((layer) => {
			return layer.layerId === newLayerGeneral.layerId
		})

		if (!layer) return

		layer.general = newLayerGeneral.general
	})

	self.updateVariableValues()
}

export function presetApplied(self: ModuleInstance, message: WebsocketCallbackData): void {
	const data: PresetListDetailData = message.data

	const didTake = data.list.filter((item) => item.currentRegion === 2 && item.sourceRegion === 4).length > 0

	data.list.forEach((preset) => {
		if (preset.currentRegion > 2 && !didTake) {
			const selectedScreensGuid = preset.screens.map((screen) => screen.guid)
			self.screens = self.screens.map((screen): Screen => {
				return {
					...screen,
					select: selectedScreensGuid.includes(screen.guid) ? 1 : 0,
				}
			})
		}
		self.presets = self.presets.map((singlePreset): Preset => {
			if (singlePreset.currentRegion === preset.currentRegion || preset.currentRegion === 6) {
				return {
					...singlePreset,
					currentRegion: 0,
				}
			} else {
				return singlePreset
			}
		})
		self.presets = self.presets.map((singlePreset): Preset => {
			if (preset.guid === singlePreset.guid) {
				return {
					...singlePreset,
					currentRegion: preset.currentRegion,
				}
			} else {
				return singlePreset
			}
		})
	})
	self.checkFeedbacks('presetState')
	self.checkFeedbacks('screenState')
}

export function sourceBackupUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const sourceBackup: SourceBackup = message.data
	realMerge(self.sourceBackups, sourceBackup)
	self.updateActions()
	self.checkFeedbacks('sourceBackupState')
}
