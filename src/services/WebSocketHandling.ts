import { ModuleInstance } from '../main.js'
import { Layer, LayerSelection } from '../interfaces/Layer.js'
import { Screen, ScreenSelectionData, UpdateLayoutData } from '../interfaces/Screen.js'
import { Preset, PresetListDetailData } from '../interfaces/Preset.js'
import { WebsocketCallbackData } from '../interfaces/WebsocketCallbackData.js'
import { filterValidScreens, isValidPreset, isValidScreen } from '../utils/listFilters.js'
import { realMerge } from '../utils/utils.js'
import { SourceBackup } from '../interfaces/SourceBackup.js'
import { sourceBackupStateKey, sourceBackupStructureKey } from '../utils/backupDisplay.js'

export const MessageTypes = {
	layersSelected: 0x81105,
	interfaceUpdated: 0x61100,
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
	screenDeleted: 0x71104,
	renameInputSource: 0x61102,
	subcardStatusUpdated: 0x5010a,
	subcardModeUpdated: 0x50404,
	layerCreate: 0x81102,
	layerDeleted: 0x81103,
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
	[MessageTypes.createScreen]: createScreen,
	[MessageTypes.screenDeleted]: screenDeleted,
	[MessageTypes.interfaceUpdated]: interfaceUpdated,
	[MessageTypes.renameInputSource]: renameInputSource,
	[MessageTypes.subcardStatusUpdated]: subcardStatusUpdated,
	[MessageTypes.subcardModeUpdated]: subcardModeUpdated,
	[MessageTypes.layerCreate]: layerCreated,
	[MessageTypes.layerDeleted]: layerDeleted,
}

export function refreshLayers(self: ModuleInstance, source: string): void {
	if (!self.apiClient) {
		return
	}

	void self.apiClient
		.getLayers()
		.then((response) => {
			self.layers = response.data.list
			self.updateVariableDefinitions()
			self.updateVariableValues()
			self.updateActions()
			self.updateFeedbacks()
			self.checkFeedbacks('selectedLayerState')
			self.updatePresets()
		})
		.catch((err) => {
			self.log('warn', `${source}: refresh layers failed: ${err instanceof Error ? err.message : String(err)}`)
		})
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
	const screens = normalizeScreenPatchData(message.data)
	if (screens.length === 0) return

	updateScreens(self, screens)
	self.updateVariableValues()
}

function normalizeScreenPatchData(data: unknown): Screen[] {
	if (data == null) return []
	if (Array.isArray(data)) return data as Screen[]
	if (typeof data === 'object') {
		if ('list' in data && Array.isArray((data as { list: unknown }).list)) {
			return (data as { list: Screen[] }).list
		}
		if ('screenId' in data) {
			return [data as Screen]
		}
	}
	return []
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
		})

		if (!screen) return
		screen.select = screenSelection.select
	})

	self.checkFeedbacks('screenState')
	self.updateVariableValues()
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
	let needsRebuild = false

	presets.forEach((preset) => {
		const newPreset = self.presets.find((oldPreset: Preset) => {
			return oldPreset.guid === preset.guid
		})
		if (!newPreset) return
		if (newPreset.name !== preset.name || newPreset.serial !== preset.serial) {
			needsRebuild = true
		}
		realMerge(newPreset, preset)
	})

	self.checkFeedbacks('presetState')
	self.updateVariableValues()

	if (needsRebuild) {
		self.updatePresets()
		self.updateFeedbacks()
	}
}

export function presetCreated(self: ModuleInstance, message: WebsocketCallbackData): void {
	const newPreset: Preset = message.data
	if (!isValidPreset(newPreset)) {
		self.log('warn', 'presetCreated: ignored preset with empty guid or name')
		return
	}
	const sanitized: Preset = {
		...newPreset,
		screens: filterValidScreens(newPreset.screens ?? []),
	}
	self.presets = self.presets.filter((preset) => preset.serial !== sanitized.serial)
	self.presets.push(sanitized)
	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
	self.updateFeedbacks()
	self.updatePresets()
}

export function presetDeleted(self: ModuleInstance, message: WebsocketCallbackData): void {
	const raw = message.data
	const items = Array.isArray(raw) ? raw : [raw]
	const deletedGuids = new Set<string>()

	items.forEach((item) => {
		if (typeof item === 'string' || typeof item === 'number') {
			const g = String(item).trim()
			if (g) deletedGuids.add(g)
			return
		}
		if (item && typeof item === 'object' && 'guid' in item && (item as { guid: unknown }).guid != null) {
			const g = String((item as { guid: unknown }).guid).trim()
			if (g) deletedGuids.add(g)
		}
	})

	if (deletedGuids.size > 0) {
		self.presets = self.presets.filter((preset) => !deletedGuids.has(preset.guid))
	}

	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
	self.updatePresets()
	self.updateFeedbacks()
}

export function globalFtbChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	const data = message.data as { ftb?: { enable?: number }; enable?: number }
	self.globalFtb = data.ftb?.enable ?? data.enable ?? self.globalFtb
	self.checkFeedbacks('globalFtbState')
}

export function globalFreezeChanged(self: ModuleInstance, message: WebsocketCallbackData): void {
	const data = message.data as { freeze?: number }
	self.globalFreeze = data.freeze ?? self.globalFreeze
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

	data?.list?.forEach((preset) => {
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
	const structureBefore = sourceBackupStructureKey(self.sourceBackups)
	const stateBefore = sourceBackupStateKey(self.sourceBackups)

	const sourceBackup: SourceBackup = message.data
	realMerge(self.sourceBackups, sourceBackup)

	if (stateBefore === sourceBackupStateKey(self.sourceBackups)) {
		return
	}

	if (structureBefore !== sourceBackupStructureKey(self.sourceBackups)) {
		self.updateActions()
		self.updatePresets()
		self.updateFeedbacks()
		self.updateVariableDefinitions()
	}

	self.updateVariableValues()
	self.checkFeedbacks('sourceBackupState')
}

export function createScreen(self: ModuleInstance, message: WebsocketCallbackData): void {
	const screen = message.data as Screen
	if (!isValidScreen(screen)) {
		self.log('warn', 'createScreen: ignored screen with empty guid or name')
		return
	}
	self.screens.push(screen)
	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
	self.updateFeedbacks()
	self.checkFeedbacks('screenState')
	self.updatePresets()
}

export function screenDeleted(self: ModuleInstance, message: WebsocketCallbackData): void {
	const deletedItems = Array.isArray(message.data) ? message.data : [message.data]
	const deletedGuids = new Set<string>()
	const deletedScreenIds = new Set<number>()

	deletedItems.forEach((item) => {
		if (item?.guid) deletedGuids.add(item.guid)
		if (item?.screenId !== undefined) deletedScreenIds.add(item.screenId)
	})

	self.screens = self.screens.filter((screen) => {
		return !deletedGuids.has(screen.guid) && !deletedScreenIds.has(screen.screenId)
	})

	self.updateVariableDefinitions()
	self.updateVariableValues()
	self.updateActions()
	self.updateFeedbacks()
	self.checkFeedbacks('screenState')
	self.updatePresets()
}

export function renameInputSource(self: ModuleInstance, message: WebsocketCallbackData): void {
	const renameItems = Array.isArray(message.data) ? message.data : [message.data]

	renameItems.forEach((renameItem) => {
		if (!renameItem?.interfaceId) return

		const targetInterface = self.interfaces.find((interfaceO) => {
			return interfaceO.interfaceId === renameItem.interfaceId
		})

		if (!targetInterface || !renameItem.general?.name) return
		targetInterface.general.name = renameItem.general.name
	})

	self.updateActions()
	self.updateFeedbacks()
	self.updateVariableValues()
}

export function interfaceUpdated(self: ModuleInstance, _message: WebsocketCallbackData): void {
	if (!self.apiClient) {
		return
	}

	void Promise.all([self.apiClient.getInterfaces(), self.apiClient.getCropSources()])
		.then(([interfacesResponse, cropSourcesResponse]) => {
			self.interfaces = interfacesResponse.data.list
			self.cropSources = cropSourcesResponse.data.list
			self.checkFeedbacks('sourceSignalState')
			self.updateVariableValues()
		})
		.catch((err) => {
			self.log(
				'warn',
				`interfaceUpdated: refresh interfaces/cropSources failed: ${err instanceof Error ? err.message : String(err)}`,
			)
		})
}

export function subcardStatusUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	interfaceUpdated(self, message)
}

export function subcardModeUpdated(self: ModuleInstance, message: WebsocketCallbackData): void {
	interfaceUpdated(self, message)
}

export function layerCreated(self: ModuleInstance, _message: WebsocketCallbackData): void {
	refreshLayers(self, 'layerCreated')
}

export function layerDeleted(self: ModuleInstance, _message: WebsocketCallbackData): void {
	refreshLayers(self, 'layerDeleted')
}
