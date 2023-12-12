import got from 'got'

import {
  DEVICES,
  HTTP_DEVICES,
  Central_Control_Protocol_FTB,
  Central_Control_Protocol_FREEZE,
  HTTP_Protocol_FTB,
  HTTP_Protocol_FREEZE,
} from './constant.js'

export const getToken = async (url, obj) => {
  const res = await got.post(`${url}/v1/system/auth/login`, {
    https: {
      rejectUnauthorized: false,
    },
    json: obj,
    timeout: {
      request: 1000
    }
  })
  const resData = JSON.parse(res.body)
  return resData
}

export const getPresetCmd = (index, presetTypeVal) => {
  let preset_buf = []
  let preset_buf_len = 0
  let temp_index = index
  // checksum = 0x5555 + all_part (no 0x55 0xaa)
  let checksum = 0x645d
  if (temp_index < 1 || temp_index > 240) {
    console.log('error', 'Invalid temp_index, value=' + temp_index + ', use default value 1')
    temp_index = 1 // Use default value 1
  }
  while (temp_index > 0) {
    preset_buf[preset_buf_len] = Math.floor(temp_index % 10) + 0x30
    checksum = checksum + preset_buf[preset_buf_len]
    temp_index = Math.floor(temp_index / 10)
    preset_buf_len = preset_buf_len + 1
  }
  let cmd_part1 = [],
    cmd_part2 = [],
    cmd_part3 = [],
    cmd_part4 = [],
    cmd_part5 = [];
  let cmd_part_len, cmd_part_xx, cmd_part_sum
  cmd_part1 = Buffer.from([
    0x55, 0xaa, 0x00, 0x7d, 0xfe, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x30, 0x00, 0x00, 0x00, 0x00,
  ])
  cmd_part2 = Buffer.from([
    0x00, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x15, 0x00, 0x00, 0x00, 0x00, 0x00, 0x5b,
    0x7b, 0x22, 0x66, 0x69, 0x6c, 0x65, 0x49, 0x64, 0x22, 0x3a,
  ])
  cmd_part3 = Buffer.from([
    0x2c, 0x22, 0x66, 0x69, 0x6c, 0x65, 0x54, 0x79, 0x70, 0x65, 0x22, 0x3a, 0x36, 0x2c, 0x22, 0x61, 0x70, 0x70, 0x6c,
    0x79, 0x54, 0x79, 0x70, 0x65, 0x22, 0x3a,
  ])

  cmd_part4 = Buffer.from([presetTypeVal])

  cmd_part5 = Buffer.from([0x7d, 0x5d])

  switch (preset_buf_len) {
    case 1:
      checksum = checksum + 0x3b
      cmd_part_len = Buffer.from([0x3b, 0x00])
      cmd_part_xx = Buffer.from([preset_buf[0]])
      break
    case 2:
      checksum = checksum + 0x3c
      cmd_part_len = Buffer.from([0x3c, 0x00])
      cmd_part_xx = Buffer.from([preset_buf[1], preset_buf[0]])
      break
    case 3:
      checksum = checksum + 0x3d
      cmd_part_len = Buffer.from([0x3d, 0x00])
      cmd_part_xx = Buffer.from([preset_buf[2], preset_buf[1], preset_buf[0]])
      break
    default:
      console.log('error', 'Invalid preset buf len!')
  }
  cmd_part_sum = Buffer.from([checksum & 0xff, (checksum >> 8) & 0xff])

  let totalBytes =
    cmd_part1.length +
    cmd_part2.length +
    cmd_part3.length +
    cmd_part4.length +
    cmd_part5.length +
    cmd_part_len.length +
    cmd_part_xx.length +
    cmd_part_sum.length
  let cmd = Buffer.concat([cmd_part1, cmd_part_len, cmd_part2, cmd_part_xx, cmd_part3, cmd_part4, cmd_part5, cmd_part_sum], totalBytes)

  return cmd
}

export const getSystemDeviceInfo = function () {
  const obj = {};
  DEVICES.forEach(item => {
    obj[item] = {
      id: item,
      label: item.toLocaleUpperCase(),
      ftb: HTTP_DEVICES.includes(item) ? HTTP_Protocol_FTB : Central_Control_Protocol_FTB,
      freeze: HTTP_DEVICES.includes(item) ? HTTP_Protocol_FREEZE : Central_Control_Protocol_FREEZE
    }
  })

  return obj
}

export async function handleReqWithToken(cb, ...args) {
  const res = await cb.bind(this)(this.config.token, ...args)
  if (res.code === 8273) {
    const tokenRes = await getToken(this.config.baseURL, {
      username: this.config.username,
      password: this.config.password,
    })
    if (tokenRes.code === 0) {
      this.config.token = tokenRes.data.token
      await cb.bind(this)(this.config.token)
    }
  }
}