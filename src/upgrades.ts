import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import { legacyUpgrade } from './Upgrades/legacyUpgrade.js'
import { upgradeToV2_0_0 } from './Upgrades/upgradeToV2.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	legacyUpgrade,
	upgradeToV2_0_0,
]
