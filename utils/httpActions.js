import got from 'got'
import { HTTP_PRESET_TYPE } from './constant.js'
import { handleReqWithToken } from './index.js'

async function getTakeReq(token) {
  const obj = {
    direction: 0,
    effectSelect: 0,
    switchEffect: {
      time: 500,
      type: 1,
    },
  }
  const res = await got.put(`${this.config.baseURL}/v1/screen/selected/take`, {
    headers: {
      Authorization: token,
    },
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
  })
  return res
}

async function getCutReq(token) {
  const obj = {
    direction: 0,
  }
  const res = await got.put(`${this.config.baseURL}/v1/screen/selected/cut`, {
    headers: {
      Authorization: token,
    },
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
  })
  return res
}

async function getFTBReq(token, event) {
  this.config.ftb = event.options.ftb
  this.checkFeedbacks('ftb');
  const obj = {
    ftb: {
      enable: Number(event.options.ftb),
      time: 700,
    },
  }
  const res = await got.put(`${this.config.baseURL}/v1/screen/selected/ftb`, {
    headers: {
      Authorization: token,
    },
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
  })
  return res
}

async function getFreezeReq(token, event) {
  this.config.freeze = event.options.freeze
  this.checkFeedbacks('freeze')
  const obj = {
    freeze: Number(event.options.freeze),
  }
  const res = await got.put(`${this.config.baseURL}/v1/screen/selected/freeze`, {
    headers: {
      Authorization: token,
    },
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
  })
  return res
}

async function getPresetReq(token, event) {
  const obj = {
    sceneType: HTTP_PRESET_TYPE[this.config.presetType],
    id: Number(event.options.preset - 1),
    presetId: 0,
  }
  this.log('info', JSON.stringify(obj))
  const res = await got.put(`${this.config.baseURL}/v1/preset/play`, {
    headers: {
      Authorization: token,
    },
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
  })
  return res
}

function handleHttpPresetType(event) {
  this.config.presetType = event.options.presetType;
  this.checkFeedbacks('pgm');
}

function handleHttpTake(event) {
  handleReqWithToken.bind(this)(getTakeReq, event)
}

function handleHttpCut(event) {
  handleReqWithToken.bind(this)(getCutReq, event)
}

function handleHttpFTB(event) {
  handleReqWithToken.bind(this)(getFTBReq, event)
}

function handleHttpFreeze(event) {
  handleReqWithToken.bind(this)(getFreezeReq, event)
}

function handleHttpPreset(event) {
  handleReqWithToken.bind(this)(getPresetReq, event)
}

export const httpActions = {
  'take': handleHttpTake,
  'cut': handleHttpCut,
  'ftb': handleHttpFTB,
  'freeze': handleHttpFreeze,
  'presetType': handleHttpPresetType,
  'preset': handleHttpPreset
}