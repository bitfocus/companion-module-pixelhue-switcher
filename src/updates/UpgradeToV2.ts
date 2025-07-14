import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { ModuleConfig } from '../Config.js'
import { LoadIn } from '../interfaces/Preset.js'

export const upgradeToV2_0_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const actions = props.actions
	const feedbacks = props.feedbacks

	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	actions.forEach((action) => {
		if (action.actionId === 'take') {
			action.options.customTimeEnabled = false
			action.options.time = 500
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'swapCopy') {
			action.actionId = 'swapOrCopy'
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'freeze') {
			action.options.freeze = Number(action.options.freeze)
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'ftb') {
			action.options.ftb = Number(action.options.ftb)
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'presetType') {
			action.actionId = 'toggleGlobalLoadPreset'
			if (action.options.presetType === 'pvw') {
				action.options.loadIn = 1
			} else {
				action.options.loadIn = 2
			}
			delete action.options.presetType
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'preset') {
			action.actionId = 'loadPreset'
			action.options.loadIn = 0
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'screen') {
			action.actionId = 'selectScreen'
			if (action.options.select === '0') {
				action.options.action = 0
			} else {
				action.options.action = 1
			}
			delete action.options.select
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'layer') {
			action.actionId = 'selectLayer'
			delete action.options.selected
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'preset_load_in') {
			action.actionId = 'loadIn'
			changes.updatedActions.push(action)
		}

		if (action.actionId === 'toggleScreen') {
			action.actionId = 'screenSelection'
			action.options.action = -1
			changes.updatedActions.push(action)
		}
	})

	feedbacks.forEach((feedback) => {
		if (feedback.feedbackId === 'swapCopy') {
			feedback.feedbackId = 'swapState'
			changes.updatedFeedbacks.push(feedback)
		}
		if (feedback.feedbackId === 'pgm') {
			feedback.feedbackId = 'globalLoadIn'
			feedback.options.loadIn = LoadIn.program
			changes.updatedFeedbacks.push(feedback)
		}

		if (feedback.feedbackId === 'ftb') {
			feedback.feedbackId = 'globalFtbState'
			changes.updatedFeedbacks.push(feedback)
		}

		if (feedback.feedbackId === 'freeze') {
			feedback.feedbackId = 'globalFreezeState'
			changes.updatedFeedbacks.push(feedback)
		}

		if (feedback.feedbackId === 'presetState') {
			feedback.options.loadIn = feedback.options.presetState
			delete feedback.options.presetState
			changes.updatedFeedbacks.push(feedback)
		}
	})

	return changes
}
