import { ModuleInstance } from './main.js'
import {
	CompanionActionContext,
	CompanionActionEvent,
	DropdownChoice,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import { Layer } from './interfaces/Layer.js'
import { Screen, SCREEN_TYPE } from './interfaces/Screen.js'
import { discoverDevices } from './services/Discovery.js'
import { ApiClient } from './services/ApiClient.js'
import { Interface } from './interfaces/Interface.js'

export function getLayerSelectionOptions(
	self: ModuleInstance,
	useSelected: boolean,
	allowedScreenTypes: number[] = [SCREEN_TYPE.SCREEN],
): SomeCompanionActionInputField[] {
	const fields: SomeCompanionActionInputField[] = []

	if (useSelected) {
		fields.push({
			type: 'checkbox',
			label: 'Use selected layer',
			id: 'useSelected',
			default: false,
		})
	}

	const screenChoices = self.screens
		.filter((screen) => allowedScreenTypes.includes(screen.screenIdObj.type))
		.map(
			(screen): DropdownChoice => ({
				id: screen.screenId,
				label: screen.general.name,
			}),
		)

	return [
		...fields,
		{
			type: 'textinput',
			label: 'Layer No.',
			id: 'layerNumber',
			default: '1',
			useVariables: true,
			isVisibleExpression: '$(options:useSelected) != true',
		},
		{
			type: 'dropdown',
			label: 'Screen',
			id: 'screenId',
			default: screenChoices[0]?.id ?? 0,
			choices: screenChoices,
			isVisibleExpression: '$(options:useSelected) != true',
		},
		{
			type: 'dropdown',
			label: 'Where',
			id: 'where',
			default: LoadIn.preview,
			choices: [
				{
					id: LoadIn.preview,
					label: 'Preview',
				},
				{
					id: LoadIn.program,
					label: 'Program',
				},
			],
			isVisibleExpression: '$(options:useSelected) != true',
		},
	]
}

export async function getLayerBySelection(
	self: ModuleInstance,
	event: CompanionActionEvent,
	context: CompanionActionContext,
): Promise<Layer | undefined> {
	if (event.options.useSelected) {
		return self.layers.find((layer) => layer.selected === 1)
	}

	const parsedLayerNumber = parseInt(await context.parseVariablesInString(<string>event.options.layerNumber ?? ''), 10)
	if (isNaN(parsedLayerNumber)) return undefined

	return self.layers.find(
		(layer) =>
			layer.layerIdObj.attachScreenId === event.options.screenId &&
			layer.serial === parsedLayerNumber &&
			layer.layerIdObj.sceneType === event.options.where,
	)
}

export function getScreenSelectionOptions(
	self: ModuleInstance,
	allowedScreenTypes: number[] = [SCREEN_TYPE.SCREEN],
): SomeCompanionActionInputField[] {
	return [
		{
			type: 'checkbox',
			label: 'Use global screen selection',
			id: 'useSelected',
			default: true,
		},
		{
			type: 'multidropdown',
			label: 'Screens',
			id: 'screenIds',
			default: [],
			choices: self.screens
				.filter((screen) => {
					return allowedScreenTypes.includes(screen.screenIdObj.type)
				})
				.filter((screen) => {
					return screen.enable === 1
				})
				.map((screen): DropdownChoice => {
					return {
						id: screen.guid,
						label: screen.general.name,
					}
				}),
			isVisibleExpression: '$(options:useSelected) != true',
		},
	]
}

export function getScreensBySelection(self: ModuleInstance, event: CompanionActionEvent): Screen[] {
	if (event.options.useSelected) {
		return self.screens.filter((screen) => {
			return screen.select === 1
		})
	} else {
		return self.screens.filter((screen) => {
			return (event.options.screenIds as string[]).includes(screen.guid)
		})
	}
}

export function buildInterfaceLookup(
	interfaces: { interfaceId: number; general: { name: string } }[],
): Record<number, string> {
	return Object.fromEntries(interfaces.map((int) => [int.interfaceId, int.general.name]))
}

export function getInputSourceChoices(self: ModuleInstance, onUpdate: () => void): DropdownChoice[] {
	const interfaceChoices = self.interfaces
		.filter((interfaceO) => {
			const interfaceType = interfaceO.auxiliaryInfo.connectorInfo.interfaceType
			const workMode = interfaceO.auxiliaryInfo.connectorInfo.workMode
			return interfaceType === 2 && workMode === 0
		})
		.map((interfaceO): DropdownChoice => {
			const typeLabel = interfaceO.linkInfo?.isLink === 1 ? 'Link' : 'Input'
			let displayName = interfaceO.general.name

			if (interfaceO.linkInfo?.isLink === 1 && interfaceO.linkInfo.sourceInfo) {
				const identify = interfaceO.linkInfo.sourceInfo.identify
				const sourceId = interfaceO.linkInfo.sourceInfo.sourceId

				const cacheKey = `${identify}:${sourceId}`
				const cachedName = self.linkedSourceNameCache?.get(cacheKey)

				if (cachedName) {
					displayName = cachedName
				} else {
					void getLinkedSourceName(self, identify, sourceId).then((name) => {
						if (name) {
							if (!self.linkedSourceNameCache) {
								self.linkedSourceNameCache = new Map()
							}
							self.linkedSourceNameCache.set(cacheKey, name)
							onUpdate()
						}
					})
				}
			}

			return {
				id: `interface_${interfaceO.interfaceId}`,
				label: `${displayName} (${typeLabel})`,
			}
		})

	const cropChoices = self.cropSources.map(
		(cropSource): DropdownChoice => ({
			id: `crop_${cropSource.cropId}`,
			label: `${cropSource.name} (Crop)`,
		}),
	)

	return [...interfaceChoices, ...cropChoices]
}

export async function getLinkedSourceName(
	self: ModuleInstance,
	identify: string,
	sourceId: number,
): Promise<string | null> {
	try {
		const devices = await discoverDevices(self.config.host, true)

		const normalizedIdentify = identify.toLowerCase()
		const identifyParts = normalizedIdentify.split(':')

		const targetDevice = devices.find((d) => {
			if (!d.mac) return false
			const mac = d.mac.toLowerCase()
			const macParts = mac.split(':')
			if (macParts.length >= 3 && identifyParts.length === 3) {
				const macLast3 = macParts.slice(-3).join(':')
				return macLast3 === normalizedIdentify
			}
			return mac.includes(normalizedIdentify) || normalizedIdentify.includes(mac)
		})

		if (!targetDevice) {
			self.log(
				'warn',
				`Linked device not found for identify: ${identify}. Available devices: ${devices
					.map((d) => `${d.deviceName} (${d.SN}, MAC: ${d.mac || 'N/A'})`)
					.join(', ')}`,
			)
			return null
		}

		const remoteApiClient = await ApiClient.create(self, targetDevice.ip, {
			targetSn: targetDevice.SN,
		})

		const interfacesResponse = await remoteApiClient.getInterfaces()
		const remoteInterfaces = interfacesResponse.data.list

		const linkedSource = remoteInterfaces.find((int: Interface) => int.interfaceId === sourceId)

		if (!linkedSource) {
			self.log(
				'warn',
				`Linked source not found for sourceId: ${sourceId} on device: ${identify} (IP: ${targetDevice.ip}, SN: ${targetDevice.SN})`,
			)
			return null
		}

		return linkedSource.general.name
	} catch (error: any) {
		self.log('error', `Failed to get linked source name: ${error.message}`)
		return null
	}
}
