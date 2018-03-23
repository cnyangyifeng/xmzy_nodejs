const configs = require('./config')
const qcloud = require('./vendor/wafer2-client-sdk/index')
const TunnelStatus = require('./services/tunnelStatus')

App({

  globalData: {
    tunnelStatus: TunnelStatus.CLOSE
  },

  /* ================================================================================ */

  onLaunch: function () {
    // 设置 login url
    qcloud.setLoginUrl(`${configs.weapp}/login`)
  },

  /* ================================================================================ */

  /*
   * 创建一个新的信道，并监听相关数据的变化
   * 由于一个小程序只能同时连接一个信道而且页面跳转后信道对象会销毁
   * 所以将创建新信道的操作放在 app.js 中统一管理
   */

  initTunnel() {
    // 创建一个新的 tunnel，放在 app.js 中供全局使用
    const that = this
    const tunnel = that.tunnel = new qcloud.Tunnel(`${configs.weapp}/tunnel`)
    // 监听 “连接已建立”
    tunnel.on(TunnelStatus.CONNECT, () => {
      console.log(`on tunnel connect`)
      this.globalData.tunnelStatus = TunnelStatus.CONNECT
      if (that.tunnelConnectCallback) {
        that.tunnelConnectCallback()
      }
    })
    // 监听 “连接被关闭（包括主动关闭和被动关闭）”
    tunnel.on(TunnelStatus.CLOSE, () => {
      console.info("on tunnel close")
      this.globalData.tunnelStatus = TunnelStatus.CLOSE
      if (that.tunnelCloseCallback) {
        that.tunnelCloseCallback()
      }
    })
    // 监听 “开始重连”
    tunnel.on(TunnelStatus.RECONNECTING, () => {
      console.info("on tunnel reconnecting")
      this.globalData.tunnelStatus = TunnelStatus.RECONNECTING
      if (that.tunnelReconnectingCallback) {
        that.tunnelReconnectingCallback()
      }
    })
    // 监听 “重连成功”
    tunnel.on(TunnelStatus.RECONNECT, () => {
      console.info("on tunnel reconnect")
      this.globalData.tunnelStatus = TunnelStatus.RECONNECT
      if (that.tunnelReconnectCallback) {
        that.tunnelReconnectCallback()
      }
    })
    // 监听 “发生错误，其中包括连接失败、重连失败、解包失败等等”
    tunnel.on(TunnelStatus.ERROR, () => {
      console.info("on tunnel error")
      this.globalData.tunnelStatus = TunnelStatus.ERROR
      if (that.tunnelErrorCallback) {
        that.tunnelErrorCallback()
      }
    })
    // ping-pong 机制，监听 “服务器 ping”
    tunnel.on('ping', () => {
      tunnel.emit('pong', {
        // openId: this.globalData.openId
      })
      console.info("emit pong")
    })
    // 打开信道
    tunnel.open()
    console.log(`open tunnel`)
  }

})