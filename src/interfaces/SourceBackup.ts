export interface SourceBackup {
	sourceBackup: {
		backup: Backup[]
		enable: number
		primaryFirst: number
	}
}

export interface Backup {
	backupSourceId: number
	backupSourceType: number
	id: number
	parentId: number
	primaryFirst: number
	primarySourceId: number
	primarySourceType: number
	switchMode: number
	usingSourceId: number
	usingSourceType: number
}
