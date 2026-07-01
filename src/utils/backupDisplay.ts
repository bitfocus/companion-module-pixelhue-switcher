import type { ModuleInstance } from '../main.js'
import type { Backup, SourceBackup } from '../interfaces/SourceBackup.js'
import { InputSourceState } from '../feedbacks.js'

/** Take the first two segments of an input source full name (split on `-`), e.g. `Input 1-2-HDMI 2.0` → `Input 1-2` */
export function shortenInputBackupDisplayName(full: string): string {
	const parts = full.split('-')
	if (parts.length < 3) return full
	return `${parts[0]}-${parts[1]}`
}

const ONLINE_INPUT_STATES = new Set<number>([
	InputSourceState.haveSignal,
	InputSourceState.haveSignalCopy,
	InputSourceState.haveSignalBackup,
])

/** Input source is considered online when it has signal (same as Input Source Signal State feedback) */
export function isInputSourceOnline(state: number): boolean {
	return ONLINE_INPUT_STATES.has(state)
}

/** Whether either primary or backup in a backup pair is offline (no signal or interface not found) */
export function backupEntryHasOfflineSource(self: ModuleInstance, entry: Backup): boolean {
	const inputs = self.getInterfaces(2, 0)
	const primary = inputs.find((i) => i.interfaceId === entry.primarySourceId)
	const backup = inputs.find((i) => i.interfaceId === entry.backupSourceId)
	return !primary || !isInputSourceOnline(primary.state) || !backup || !isInputSourceOnline(backup.state)
}

/** Fields that affect action/feedback/preset/variable definitions (dropdown choices, preset buttons). */
export function sourceBackupStructureKey(sourceBackups: SourceBackup): string {
	const { backup, enable } = sourceBackups.sourceBackup
	return JSON.stringify({
		enable,
		backup: (backup ?? []).map((b) => ({
			id: b.id,
			primarySourceId: b.primarySourceId,
			primarySourceType: b.primarySourceType,
			backupSourceId: b.backupSourceId,
			backupSourceType: b.backupSourceType,
		})),
	})
}

/** Full runtime state including active source selection. */
export function sourceBackupStateKey(sourceBackups: SourceBackup): string {
	return JSON.stringify(sourceBackups)
}

/** Same as actions/feedbacks: resolve names from interfaces with interfaceType=2, workMode=0 */
export function getBackupActiveSourceShortDisplay(self: ModuleInstance, backup: Backup): string {
	const list = self.getInterfaces(2, 0)
	const usingPrimary =
		backup.usingSourceId === backup.primarySourceId && backup.usingSourceType === backup.primarySourceType
	const activeId = usingPrimary ? backup.primarySourceId : backup.backupSourceId
	const iface = list.find((i) => i.interfaceId === activeId)
	const full = iface?.general?.name ?? String(activeId)
	return shortenInputBackupDisplayName(full)
}
