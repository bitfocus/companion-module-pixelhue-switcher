import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { PRESET_CATEGORY } from '../utils/constants.js'

export function getBackupDefinitions(self: ModuleInstance): CompanionPresetDefinitions {
	const backupDefinitions: CompanionPresetDefinitions = {}

	self.sourceBackups.sourceBackup.backup.forEach((backup) => {
		backupDefinitions['presetLabelScreenToggle'] = {
			type: 'text',
			category: PRESET_CATEGORY.BACKUP,
			text: 'Input Backup',
			name: 'Input Backup',
		}
		backupDefinitions[`switchSourceBackup${backup.id}`] = {
			type: 'button',
			name: `Toggle Backup ${backup.id} Input`,
			category: PRESET_CATEGORY.BACKUP,
			style: {
				text: `Backup ${backup.id}`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'switchSourceBackup',
							options: {
								backupSourceId: backup.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'sourceBackupState',
					style: {
						bgcolor: combineRgb(0, 204, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						backupSourceId: backup.id,
					},
				},
			],
		}
	})

	return backupDefinitions
}
