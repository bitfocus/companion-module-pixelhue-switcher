import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { LoadIn } from './interfaces/Preset.js'
import { DropdownChoice } from '@companion-module/base'
import { SCREEN_TYPE } from './interfaces/Screen.js'

export function updateCompanionFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		globalLoadIn: {
			name: 'Global Load In State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'loadIn',
					type: 'dropdown',
					label: 'Load In',
					default: LoadIn.preview,
					choices: [
						{
							id: LoadIn.preview,
							label: 'Preview',
						},
						{
							id: LoadIn.program,
							label: 'Program',
						},
					],
				},
			],
			callback: (feedback) => {
				return self.globalLoadPresetIn == +feedback.options.loadIn!
			},
		},
		presetState: {
			name: 'Preset State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Preset',
					id: 'presetId',
					default: 1,
					choices: self.presets
						.sort((preset1, preset2) => {
							if (preset1.serial > preset2.serial) return 1
							if (preset1.serial < preset2.serial) return -1
							return 0
						})
						.map((preset): DropdownChoice => {
							return {
								id: preset.guid,
								label: `${preset.serial}. ${preset.name}`,
							}
						}),
				},
				{
					id: 'loadIn',
					type: 'dropdown',
					label: 'Loaded In',
					default: LoadIn.program,
					choices: [
						{
							id: LoadIn.preview,
							label: 'Preview',
						},
						{
							id: LoadIn.program,
							label: 'Program',
						},
					],
				},
			],
			callback: (feedback) => {
				const preset = self.presets.find((preset) => {
					return preset.guid === feedback.options.presetId!
				})
				return preset?.currentRegion === +feedback.options.loadIn! || preset?.currentRegion === 6
			},
		},
		swapState: {
			name: 'Swap State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.swapEnabled
			},
		},
		screenState: {
			name: 'Screen Selection State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.select === 1
			},
		},
		screenFreezeState: {
			name: 'Screen Freeze State',
			type: 'boolean',
			defaultStyle: {
				pngalignment: 'right:top',
				png64:
					'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAADiNXWtAAABl0lEQVRIDeVVbU7DMAxNUj7uMHEXyokmTtD2BGgnotwF7Q6A1pBX79V2p04r4wcSkdL44yWxn50thH81NruPFnNN0vES8MPLVz2koQ4hNsCnIT5B32/vW+jnxs05J31Dyq/lcKrB6O1kXBDSgj14KnJ3ilObx3qkhlXsSgVAoCN3lobN7jPDs9/eTfvk8NiANvgw3p9v+1EoH0fRocpNzLGmc80qtJWQYujLPsxxOIqqQ+yOgNGZY3xEVlAsDZThA2YElw/24gzqWKdUoTBdyD8doMpS5DJIQ+rlYHAPnrWQiA6bMW2WUifFSjtreC4DNavEwtrIpBnQur7guksll4Gaf09yF6AGiJhF5Irr0GGIHBMyQyCGe+GnD6ujyKZuQetk/3ZcBjjIFpCFnRechZ0XXPBsFAnLXSAPLdTiKunl/MaWsy+aMnzAKD44+mB3L/n4SDo4+DIhXzakpauDz2BxL4sHAAsoDYAm0Eagf+kgV+QlEN/C3G9/9OY+6q4GNJ6uuUNB1T7X1XOVJFSt+8u86sI/sfkbt1neAWb12WMAAAAASUVORK5CYII=',
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.freeze === 1
			},
		},
		screenFtbState: {
			name: 'Screen FTB State',
			type: 'boolean',
			defaultStyle: {
				pngalignment: 'right:top',
				png64:
					'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAACm0lEQVRYCe1WPYsUQRCtutPI2EB/g6KBIEbuoZgLgpj5hck1ZkaCtysIhiK3gYGYySFoYCjorRiZCf4AEwPFQAw0ULz2ve6pmZ4vtvfcZQ0sqO2a7up6b6q6a1a997JMWVkmOLH/fQI6lsfQw4vKVE4GHgB8CyT2L4KE5hxCgF8E+BXoKXH6MxC57wco4CDYOzIJ43WNY3iIP9Pi5xFQFdn0dxHyAPQDdCOGb/wqiPyWkSREphHIKYGh3IRxHGrgI9mRNWREw0hwj4ysyDbIDm3TtHGWDDAowT9DrwH4Oca6sCyr8CERkkMm5pMBBiY431LkGPQe3vIIxrow9SwBhUQyJK8EFozBnX5E3AvQJyBxsIUR6z8KWYjEWy7pRB4B22GHy+lbTN2GPgWJfbZcjnYr7JaUC20jjwBrGtOfRtjCwwvoQ5BQaNUnjGjq3WPnEeBmkkhFQxsfFlMc9xa2SEbqzTePgL19Gnhdf+E8eAS6DD0DXbOg5QG0UpQLbSOPgJfXYWtXTZ3+wNo56C2UgX2ikoxS5PeBsd8uysCbMKxQCmvTH4X1DGflE/xOwA5+8+kDxLD7zX7Q1emcvgP49wCu8qaTJOM0JK8E3MR0srvF87DROmg8H14OwfMlxq8gudrA6nzMJ8DtJGHnoRnOzofT01j6Br3TdOl63tM1mTXHj87YT0rf+jW9ivlXyMIljI9Knw5jtgykAVgKgpraVaVP/M9wFtYN/JcYcKpPdk8gfhcUYFGbpXH6BaDnoa4PnPN/U4IB9k+gUVROIht1cfoe15A9oldmz0DVA6qbwGvJUqRl6IWsL+Q3onRf7AP17z3B17Vqx4X/tEa0OwIMzntvV4/PVWb4VMpcCJTRFmDMfgbmTOI/gaVn4A/7qdrLn1GI3AAAAABJRU5ErkJggg==',
			},
			options: [
				{
					type: 'dropdown',
					label: 'Screen',
					id: 'screenId',
					default: 1,
					choices: self.screens.map((screen): DropdownChoice => {
						return {
							id: screen.screenId,
							label: screen.general.name,
						}
					}),
				},
			],
			callback: (feedback) => {
				const screen = self.screens.find((screen) => {
					return screen.screenId === feedback.options.screenId!
				})
				return screen?.ftb.enable === 1
			},
		},
		globalFtbState: {
			name: 'Global FTB State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.globalFtb === 1
			},
		},
		globalFreezeState: {
			name: 'Global Freeze State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.globalFreeze === 1
			},
		},
		selectedLayerState: {
			name: 'Selected Layer State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Layer',
					id: 'layerId',
					default: 1,
					choices: self.layers
						.filter(
							(layer) =>
								layer.general.name !== '' &&
								layer.layerIdObj.attachScreenId !==
									self.screens.find((s) => s.screenIdObj.type === SCREEN_TYPE.MVR)?.screenId,
						)
						.map((layer): DropdownChoice => {
							const screenName =
								self.screens.find((screen) => screen.screenId === layer.layerIdObj.attachScreenId)?.general?.name ?? ''
							const sceneType = layer.layerIdObj.sceneType === 2 ? 'PGM' : layer.layerIdObj.sceneType === 4 ? 'PVW' : ''

							return {
								id: layer.layerId,
								label: `${screenName} -  [L${layer.serial}] ${sceneType} ${layer.general.name}`,
							}
						}),
				},
			],
			callback: (feedback) => {
				return self.getVariableValue('selected_layer') === feedback.options.layerId
			},
		},
	})
}
