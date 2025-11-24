export type ModelKey = 'P10' | 'P20' | 'P80' | 'Q8' | 'PF'

/** Keep this list in sync with your fleet. */
export const MODEL_ID_TO_KEY: Record<number, ModelKey> = {
	28944: 'P20',
	28945: 'P10',
	29974: 'Q8',
	30006: 'P80',
	0: 'PF',
}
