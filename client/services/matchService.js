const TunnelEvent = require('./tunnelEvent')
const TunnelStatus = require('./tunnelStatus')

/**
 * 师生匹配
 */

var match = (page, app, options) => {
  // 关闭之前的信道
  if (app.globalData.tunnelStatus !== TunnelStatus.CLOSE) {
    console.log(`close previous tunnel`)
    app.tunnel.close()
  }
  // 创建一个新的信道，并监听相关数据的变化
  app.initTunnel()
  // 监听 “连接已建立” 的 callback
  app.tunnelConnectCallback = () => {
    console.log(`on tunnel connect callback`)
    const content = {
      studentId: page.data.student.studentId
    }
    app.tunnel.emit(TunnelEvent.QUICK_MATCH_REQ, content)
    console.log(`emit a '${TunnelEvent.QUICK_MATCH_REQ}' message: `, content)
  }
  // 监听 “连接被关闭（包括主动关闭和被动关闭）” 的 callback
  app.tunnelCloseCallback = () => {
    console.log(`on tunnel close callback`)
  }
  // 监听 “开始重连” 的 callback
  app.tunnelReconnectingCallback = () => {
    console.log(`on tunnel reconnecting callback`)
  }
  // 监听 “重连成功” 的 callback
  app.tunnelReconnectCallback = () => {
    console.log(`on tunnel reconnect callback`)
  }
  // 监听 “信道发生错误” 的 callback
  app.tunnelErrorCallback = err => {
    console.log(`on tunnel error callback: ${err}`)
  }
}

module.exports = {
  match: match
}