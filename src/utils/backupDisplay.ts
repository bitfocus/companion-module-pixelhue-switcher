import type { ModuleInstance } from '../main.js'
import type { Backup } from '../interfaces/SourceBackup.js'

/** 输入源全名截取前两段（以 `-` 分割），例如 `Input 1-2-HDMI 2.0` → `Input 1-2` */
export function shortenInputBackupDisplayName(full: string): string {
	const parts = full.split('-')
	if (parts.length < 3) return full
	return `${parts[0]}-${parts[1]}`
}

/** 与动作/反馈一致：用 interfaceType=2、workMode=0 的接口表解析名称 */
export function getBackupActiveSourceShortDisplay(self: ModuleInstance, backup: Backup): string {
	const list = self.getInterfaces(2, 0)
	const usingPrimary =
		backup.usingSourceId === backup.primarySourceId && backup.usingSourceType === backup.primarySourceType
	const activeId = usingPrimary ? backup.primarySourceId : backup.backupSourceId
	const iface = list.find((i) => i.interfaceId === activeId)
	const full = iface?.general?.name ?? String(activeId)
	return shortenInputBackupDisplayName(full)
}
