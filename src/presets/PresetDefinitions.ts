import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { PRESET_CATEGORY } from '../utils/constants.js'
import { LoadIn } from '../interfaces/Preset.js'

export function getPresetsPresetDefinitions(self: ModuleInstance): CompanionPresetDefinitions {
	const presetsPresetDefinitions: CompanionPresetDefinitions = {}

	self.presets.forEach((preset) => {
		/* Load in Preview */
		presetsPresetDefinitions['presetLabelPreview'] = {
			type: 'text',
			category: PRESET_CATEGORY.PREVIEW,
			text: 'Load selected preset in Preview',
			name: 'Preview',
		}
		presetsPresetDefinitions[`preset${preset.serial}Preview`] = {
			type: 'button',
			name: `Preset ${preset.serial} Load (Preview)`,
			category: PRESET_CATEGORY.PREVIEW,
			style: {
				text: `$(${self.id}:preset_${preset.serial}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.serial,
								loadIn: LoadIn.preview,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.preview,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.program,
					},
				},
			],
		}
		/* Load in Program */
		presetsPresetDefinitions['presetLabelProgram'] = {
			type: 'text',
			category: PRESET_CATEGORY.PROGRAM,
			text: 'Load selected preset in Program',
			name: 'Program',
		}
		presetsPresetDefinitions[`preset${preset.serial}Program`] = {
			type: 'button',
			name: `Preset ${preset.serial} Load (Program)`,
			category: PRESET_CATEGORY.PROGRAM,
			style: {
				text: `$(${self.id}:preset_${preset.serial}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.serial,
								loadIn: LoadIn.program,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.program,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.program,
					},
				},
			],
		}
		/* Load using Global Setting */
		presetsPresetDefinitions['presetLabelGlobal'] = {
			type: 'text',
			category: PRESET_CATEGORY.GLOBAL,
			text: 'Load selected preset using Global Setting',
			name: 'Global',
		}
		presetsPresetDefinitions[`preset${preset.serial}Global`] = {
			type: 'button',
			name: `Preset ${preset.serial} Load (Global)`,
			category: PRESET_CATEGORY.GLOBAL,
			style: {
				text: `$(${self.id}:preset_${preset.serial}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loadPreset',
							options: {
								presetId: preset.serial,
								loadIn: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.preview,
					},
				},
				{
					feedbackId: 'presetState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						presetId: preset.serial,
						loadIn: LoadIn.program,
					},
				},
			],
		}
	})

	return presetsPresetDefinitions
}
