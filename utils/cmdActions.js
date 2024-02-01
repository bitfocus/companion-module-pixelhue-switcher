import { getPresetCmd } from "./index.js"
import {
  Central_Control_Protocol_CUT,
  Central_Control_Protocol_FREEZE,
  Central_Control_Protocol_FTB,
  Central_Control_Protocol_TAKE,
  PRESET_TYPE,
  Central_Control_Protocol_Device_PresetType
} from "./constant.js"

function handleCmdTake() {
  let cmd = Buffer.from(Central_Control_Protocol_TAKE)
  this.socket.send(cmd)
}

function handleCmdCut() {
  let cmd = Buffer.from(Central_Control_Protocol_CUT)
  this.socket.send(cmd)
}

function handleCmdFTB(event) {
  let element = Central_Control_Protocol_FTB.find((element) => element.id === event.options.ftb)
  this.config.ftb = event.options.ftb
  this.checkFeedbacks('ftb')
  this.socket.send(element.cmd)
}

function handleCmdFreeze(event) {
  this.config.freeze = event.options.freeze
  this.checkFeedbacks('freeze')
  let element = Central_Control_Protocol_FREEZE.find((element) => element.id === event.options.freeze)
  this.socket.send(element.cmd)
}

function handleCmdPresetType(event) {
  this.config.presetType = event.options.presetType
  this.checkFeedbacks('pgm')
}

function handleCmdPreset(event) {
  // 先下发全局applyType协议
  let presetTypeCmd = Buffer.from(Central_Control_Protocol_Device_PresetType[this.config.presetType ?? 'pvw'])
  this.socket.send(presetTypeCmd)
  
  // 0.5s在下发场景协议
  setTimeout(() => {    
    let cmd = getPresetCmd(event.options.preset, PRESET_TYPE[this.config.presetType] ?? PRESET_TYPE.pvw)
    this.socket.send(cmd)
  }, 500)
}

export const cmdActions = {
  'take': handleCmdTake,
  'cut': handleCmdCut,
  'ftb': handleCmdFTB,
  'freeze': handleCmdFreeze,
  'presetType': handleCmdPresetType,
  'preset': handleCmdPreset
}