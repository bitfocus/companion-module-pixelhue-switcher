import { ModuleInstance } from './main.js'
import {
	CompanionActionContext,
	CompanionActionEvent,
	DropdownChoice,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import { LoadIn } from './interfaces/Preset.js'
import { Layer } from './interfaces/Layer.js'
import { SCREEN_TYPE } from './interfaces/Screen.js'

export function getLayerSelectionOptions(
	self: ModuleInstance,
	allowedScreenTypes: number[] = [SCREEN_TYPE.SCREEN],
): SomeCompanionActionInputField[] {
	return [
		{
			type: 'textinput',
			label: 'Layer No.',
			id: 'layerNumber',
			required: true,
			default: '1',
			useVariables: true,
		},
		{
			type: 'dropdown',
			label: 'Screen',
			id: 'screenId',
			default: 0,
			choices: self.screens
				.filter((screen) => {
					return allowedScreenTypes.includes(screen.screenIdObj.type)
				})
				.map((screen): DropdownChoice => {
					return {
						id: screen.screenId,
						label: screen.general.name,
					}
				}),
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
		},
	]
}

export async function getLayerBySelection(
	self: ModuleInstance,
	event: CompanionActionEvent,
	context: CompanionActionContext,
): Promise<Layer | undefined> {
	const parsedLayerNumber = parseInt(await context.parseVariablesInString(<string>event.options.layerNumber))
	if (isNaN(parsedLayerNumber)) return undefined

	return self.layers.find((layer) => {
		return (
			layer.layerIdObj.attachScreenId === event.options.screenId &&
			layer.serial === parsedLayerNumber &&
			layer.layerIdObj.sceneType === event.options.where
		)
	})
}
