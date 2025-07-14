import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './Config.js'
import { legacyUpgrade } from './updates/LegacyUpgrade.js'
import { upgradeToV2_0_0 } from './updates/UpgradeToV2.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [legacyUpgrade, upgradeToV2_0_0]
