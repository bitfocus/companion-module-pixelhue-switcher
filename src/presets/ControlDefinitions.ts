import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { PRESET_CATEGORY } from '../utils/constants.js'
import { LoadIn } from '../interfaces/Preset.js'

export function getControlPresetDefinitions(self: ModuleInstance): CompanionPresetDefinitions {
	return {
		take: {
			type: 'button',
			name: 'TAKE',
			category: PRESET_CATEGORY.CONTROL,
			style: {
				text: 'TAKE',
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'take',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		cut: {
			type: 'button',
			name: 'CUT',
			category: PRESET_CATEGORY.CONTROL,
			style: {
				text: 'CUT',
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'cut',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		freeze: {
			type: 'button',
			name: 'Freeze',
			category: PRESET_CATEGORY.CONTROL,
			style: {
				text: 'Freeze',
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'freeze',
							options: {
								freeze: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalFreezeState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {},
				},
			],
		},
		ftb: {
			type: 'button',
			name: 'FTB',
			category: PRESET_CATEGORY.CONTROL,
			style: {
				text: 'FTB',
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'ftb',
							options: {
								ftb: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalFtbState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {},
				},
			],
		},
		globalLoadIn: {
			type: 'button',
			name: 'Global Load In',
			category: PRESET_CATEGORY.CONTROL,
			style: {
				text: `$(${self.id}:global_load_in_short)`,
				size: 24,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggleGlobalLoadPreset',
							options: {
								loadIn: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'globalLoadIn',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						loadIn: LoadIn.program,
					},
				},
				{
					feedbackId: 'globalLoadIn',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						loadIn: LoadIn.preview,
					},
				},
			],
		},
	}
}
