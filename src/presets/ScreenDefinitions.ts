import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { PRESET_CATEGORY } from '../utils/constants.js'

export function getScreenPresetDefinitions(self: ModuleInstance): CompanionPresetDefinitions {
	const screensPresetDefinitions: CompanionPresetDefinitions = {}

	self.screens.forEach((screen) => {
		screensPresetDefinitions['presetLabelScreenToggle'] = {
			type: 'text',
			category: PRESET_CATEGORY.SCREENS,
			text: 'Toggle Screen Selection',
			name: 'Screen',
		}
		screensPresetDefinitions[`toggleScreen${screen.screenId}`] = {
			type: 'button',
			name: `Toggle Screen ${screen.screenId} Selection`,
			category: PRESET_CATEGORY.SCREENS,
			style: {
				text: `$(${self.id}:screen_${screen.screenId}_name)`,
				size: 16,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectScreen',
							options: {
								screenId: screen.screenId,
								action: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'screenFtbState',
					style: {
						pngalignment: 'right:top',
						png64:
							'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAACm0lEQVRYCe1WPYsUQRCtutPI2EB/g6KBIEbuoZgLgpj5hck1ZkaCtysIhiK3gYGYySFoYCjorRiZCf4AEwPFQAw0ULz2ve6pmZ4vtvfcZQ0sqO2a7up6b6q6a1a997JMWVkmOLH/fQI6lsfQw4vKVE4GHgB8CyT2L4KE5hxCgF8E+BXoKXH6MxC57wco4CDYOzIJ43WNY3iIP9Pi5xFQFdn0dxHyAPQDdCOGb/wqiPyWkSREphHIKYGh3IRxHGrgI9mRNWREw0hwj4ysyDbIDm3TtHGWDDAowT9DrwH4Oca6sCyr8CERkkMm5pMBBiY431LkGPQe3vIIxrow9SwBhUQyJK8EFozBnX5E3AvQJyBxsIUR6z8KWYjEWy7pRB4B22GHy+lbTN2GPgWJfbZcjnYr7JaUC20jjwBrGtOfRtjCwwvoQ5BQaNUnjGjq3WPnEeBmkkhFQxsfFlMc9xa2SEbqzTePgL19Gnhdf+E8eAS6DD0DXbOg5QG0UpQLbSOPgJfXYWtXTZ3+wNo56C2UgX2ikoxS5PeBsd8uysCbMKxQCmvTH4X1DGflE/xOwA5+8+kDxLD7zX7Q1emcvgP49wCu8qaTJOM0JK8E3MR0srvF87DROmg8H14OwfMlxq8gudrA6nzMJ8DtJGHnoRnOzofT01j6Br3TdOl63tM1mTXHj87YT0rf+jW9ivlXyMIljI9Knw5jtgykAVgKgpraVaVP/M9wFtYN/JcYcKpPdk8gfhcUYFGbpXH6BaDnoa4PnPN/U4IB9k+gUVROIht1cfoe15A9oldmz0DVA6qbwGvJUqRl6IWsL+Q3onRf7AP17z3B17Vqx4X/tEa0OwIMzntvV4/PVWb4VMpcCJTRFmDMfgbmTOI/gaVn4A/7qdrLn1GI3AAAAABJRU5ErkJggg==',
					},
					options: {
						screenId: screen.guid,
					},
				},
				{
					feedbackId: 'screenFreezeState',
					style: {
						pngalignment: 'right:top',
						png64:
							'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAADiNXWtAAABl0lEQVRIDeVVbU7DMAxNUj7uMHEXyokmTtD2BGgnotwF7Q6A1pBX79V2p04r4wcSkdL44yWxn50thH81NruPFnNN0vES8MPLVz2koQ4hNsCnIT5B32/vW+jnxs05J31Dyq/lcKrB6O1kXBDSgj14KnJ3ilObx3qkhlXsSgVAoCN3lobN7jPDs9/eTfvk8NiANvgw3p9v+1EoH0fRocpNzLGmc80qtJWQYujLPsxxOIqqQ+yOgNGZY3xEVlAsDZThA2YElw/24gzqWKdUoTBdyD8doMpS5DJIQ+rlYHAPnrWQiA6bMW2WUifFSjtreC4DNavEwtrIpBnQur7guksll4Gaf09yF6AGiJhF5Irr0GGIHBMyQyCGe+GnD6ujyKZuQetk/3ZcBjjIFpCFnRechZ0XXPBsFAnLXSAPLdTiKunl/MaWsy+aMnzAKD44+mB3L/n4SDo4+DIhXzakpauDz2BxL4sHAAsoDYAm0Eagf+kgV+QlEN/C3G9/9OY+6q4GNJ6uuUNB1T7X1XOVJFSt+8u86sI/sfkbt1neAWb12WMAAAAASUVORK5CYII=',
					},
					options: {
						screenId: screen.guid,
					},
				},
				{
					feedbackId: 'screenState',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
					options: {
						screenId: screen.guid,
					},
				},
			],
		}
	})

	return screensPresetDefinitions
}
