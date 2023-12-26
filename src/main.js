import { InstanceBase, InstanceStatus, TCPHelper, UDPHelper, Regex, runEntrypoint } from '@companion-module/base'
import ping from 'ping';

import { getActions } from './actions.js'
import { getPresetDefinitions } from './presets.js'
import { getFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'

import {
  HTTP_DEVICES,
  PROTOCOL_TYPE,
  CMD_DEVICES,
  DEVICES_INFORMATION,
  RETRY_COUNT
} from '../utils/constant.js'
import { getSystemDeviceInfo, getToken } from '../utils/index.js'
import { retry } from '../utils/retry.js';

const LATCH_ACTIONS = ['ftb', 'freeze', 'presetType'];
class ModuleInstance extends InstanceBase {
  constructor(internal) {
    super(internal)

    this.PROTOCOL_TYPE = Object.values(PROTOCOL_TYPE)

    this.DEVICES_INFO = getSystemDeviceInfo();
    this.DEVICES = Object.values(this.DEVICES_INFO)

    // Sort alphabetical
    this.DEVICES.sort(function (a, b) {
      var x = a.label.toLowerCase()
      var y = b.label.toLowerCase()
      if (x < y) {
        return -1
      }
      if (x > y) {
        return 1
      }
      return 0
    })
  }

  updateActions() {
    this.log('debug', 'update actions....')
    this.setActionDefinitions(getActions(this))
  }

  updateFeedbacks() {
    this.setFeedbackDefinitions(getFeedbacks(this))
  }

  // Return config fields for web config
  getConfigFields() {
    this.log('getting the fields....')
    return [
      {
        type: 'static-text',
        id: 'info',
        width: 12,
        label: 'Information',
        value: DEVICES_INFORMATION,
      },
      {
        type: 'textinput',
        id: 'host',
        label: 'IP Address',
        width: 6,
        default: '192.168.0.10',
        regex: Regex.IP,
      },
      {
        type: 'dropdown',
        id: 'modelId',
        label: 'Model',
        width: 6,
        choices: this.DEVICES,
        default: this.DEVICES[0].id,
      },
      // {
      //   type: 'textinput',
      //   id: 'port',
      //   label: 'Port',
      //   width: 6,
      //   default: '8088',
      //   regex: Regex.PORT,
      // },
      {
        type: 'textinput',
        id: 'username',
        label: 'Username',
        width: 6,
        default: '',
        isVisibleData: HTTP_DEVICES,
        isVisible: (options, httpDevices) => httpDevices.includes(options.modelId),
      },
      {
        type: 'textinput',
        id: 'password',
        label: 'Password',
        width: 6,
        default: '',
        isVisibleData: HTTP_DEVICES,
        isVisible: (options, httpDevices) => httpDevices.includes(options.modelId),
      },
    ]
  }

  // When module gets deleted
  async destroy() {
    this.log('info', 'destroy:' + this.id)
    if (this.socket !== undefined) {
      this.socket.destroy()
    }
    if (this.udp !== undefined) {
      this.udp.destroy()
    }
    if (this.heartbeat) {
      clearInterval(this.heartbeat)
      delete this.heartbeat
    }
  }

  /** devices http handle start */
  async getDeviceStatus() {
    this.config.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/unico`
    this.log('info', `tokenUrl:${this.config.baseURL}`)
    this.log('info', `tokenInfo:${this.config.username}/${this.config.password}`)

    const res = await getToken(this.config.baseURL, {
      username: this.config.username,
      password: this.config.password,
    })

    this.log('info', `tokenRes:`)
    this.log('info', JSON.stringify(res))

    if (res.code === 0) {
      this.config.token = res.data.token
      this.updateStatus(InstanceStatus.Ok)
    } else if (res.code === 8274) {
      this.updateStatus(InstanceStatus.BadConfig)
    } else {
      this.updateStatus(InstanceStatus.ConnectionFailure)
    }
  }

  async getProtocol() {
    this.log('info', 'getProtocol')
    this.config.port = 8088
    try {
      try {
        this.config.protocol = 'http'
        await retry(this.getDeviceStatus.bind(this), RETRY_COUNT)
      } catch (e) {
        this.config.protocol = 'https'
        await retry(this.getDeviceStatus.bind(this), RETRY_COUNT)
      }
    } catch (e) {
      this.log('info', `getProtocol-${this.config.protocol}-cache-${e.code}`)
      this.updateStatus(InstanceStatus.ConnectionFailure)
    }
  }
  /** devices http handle end */

  /** devices cmd handle start */
  //update device status
  updateDeviceStatus(isAlive) {
    this.log('debug', 'ping test:' + isAlive + ", lastState:" + this.lastState)
    if (isAlive == true) {
      this.log('debug', 'ping check ok.')
      if (this.lastState !== 0) {
        this.log('info', 'connection recover, try to reconnect device.')
        this.updateStatus(InstanceStatus.Connecting)
        //try to reconnect
        this.initUDP()
        this.initTCP()
        this.lastState = 0
      }
    } else {
      if (isAlive == false && this.lastState === 0) {
        this.updateStatus(InstanceStatus.ConnectionFailure)
        this.log('info', 'ping check failure.')
        this.lastState = 1
      }
    }
  }

  pingTest() {
    ping.sys.probe(this.config.host, (isAlive) => this.updateDeviceStatus(isAlive), { timeout: 1 })
  }

  initTCP() {
    if (this.socket !== undefined) {
      this.socket.destroy()
      delete this.socket
    }

    this.config.port = 5400

    if (this.config.host) {
      this.socket = new TCPHelper(this.config.host, this.config.port)

      this.socket.on('status_change', (status, message) => {
        this.updateStatus(status, message)
      })

      this.socket.on('error', (err) => {
        this.updateStatus(InstanceStatus.ConnectionFailure)
        this.log('error', 'Network error: ' + err.message)
        console.log('TCP Connection error, Try to reconnect.')
        this.updateStatus(InstanceStatus.Connecting)
        if (this.udp !== undefined) {
          let cmd_connect = Buffer.from([
            0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
            0x00, 0x03, 0xfe, 0xff,
          ]) // Port FFFE
          this.udp.send(cmd_connect)
        } else {
          this.initUDP()
        }
      })

      this.socket.on('connect', () => {
        let cmd = Buffer.from([
          0x55, 0xaa, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00,
          0x57, 0x56,
        ])
        this.socket.send(cmd)
        this.log('debug', 'Connected')
        this.updateStatus(InstanceStatus.Ok)
      })

      // if we get any data, display it to stdout
      this.socket.on('data', (buffer) => {
        //future feedback can be added here
        // this.log('debug', 'Tcp recv:' + buffer);
      })
    } else {
      this.log('error', 'No host configured')
      this.updateStatus(InstanceStatus.BadConfig)
    }
  }

  initUDP() {
    if (this.udp !== undefined) {
      this.udp.destroy()
      delete this.udp
    }

    if (this.config.host !== undefined) {
      this.udp = new UDPHelper(this.config.host, 3800)

      this.udp.on('error', (err) => {
        this.debug('Network error', err)
        this.log('error', 'Network error: ' + err.message)
        this.updateStatus(InstanceStatus.ConnectionFailure)
      })

      // If we get data, thing should be good
      this.udp.on('data', () => {
        // this.status(this.STATE_WARNING, 'Connecting...')
      })

      this.udp.on('status_change', (status, message) => {
        this.log('debug', 'UDP status_change: ' + status)
      })
      this.log('debug', 'initUDP finish')
    } else {
      this.log('error', 'No host configured')
      this.updateStatus(InstanceStatus.BadConfig)
    }

    if (this.udp !== undefined) {
      let cmd_register = Buffer.from([
        0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
        0x00, 0x03, 0xfe, 0xff,
      ])
      this.udp.send(cmd_register)
      this.log('info', 'UDP registration.')
    }
  }
  /** devices cmd handle end */

  updateDefaultInfo() {
    LATCH_ACTIONS.map(item => {
      delete this.config[item]
    })
    this.updateActions()
    this.updateFeedbacks()
    this.setPresetDefinitions(getPresetDefinitions(this))
  }

  async configUpdated(config) {
    this.log('info', 'configUpdated modules...')
    let resetConnection = false
    if (this.config.host !== config.host || this.config.port !== config.port || this.config.modelId !== config.modelId) {
      resetConnection = true
    }

    delete this.config.token
    this.config = {
      ...this.config,
      ...config,
      model: this.DEVICES_INFO[config.modelId],
    }

    if (HTTP_DEVICES.includes(this.config.modelId)) {

      if (this.socket !== undefined) {
        this.socket.destroy()
      }
      if (this.heartbeat) {
        clearInterval(this.heartbeat)
        delete this.heartbeat
      }

      await this.getProtocol()

      this.updateDefaultInfo.bind(this)()
    } else {
      const isRefresh = resetConnection === true || this.socket === undefined;
      if (!isRefresh) return;

      if (this.heartbeat) {
        clearInterval(this.heartbeat)
        delete this.heartbeat
      }

      this.initUDP()
      this.initTCP()
      this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s

      this.updateDefaultInfo.bind(this)()
    }
  }

  init(config) {

    this.config = Object.assign({}, config)

    if (this.config.modelId !== undefined) {
      this.config.model = this.DEVICES_INFO[this.config.modelId]
    } else {
      this.config.modelId = this.DEVICES[0].id
      this.config.model = this.DEVICES[0]
    }

    if (CMD_DEVICES.includes(this.config.modelId)) {
      this.initUDP()
      this.initTCP()
      this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s
    }

    this.updateDefaultInfo.bind(this)()
  }
}

runEntrypoint(ModuleInstance, upgradeScripts)
