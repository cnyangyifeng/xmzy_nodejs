const { tunnel } = require('../qcloud')
const configs = require('../config')
const redis = require('redis')
const pub = redis.createClient(configs.redis.port, configs.redis.host, { password: configs.redis.pass })
const TunnelEvent = require('../services/tunnelEvent')

/* ================================================================================ */

/**
 * 调用 tunnel.broadcast() 进行广播
 * @param  {String} type    消息类型
 * @param  {String} content 消息内容
 */

const $broadcast = (type, content) => {
  tunnel.broadcast(connectedTunnelIds, type, content)
    .then(result => {
      const invalidTunnelIds = result.data && result.data.invalidTunnelIds || []
      if (invalidTunnelIds.length) {
        console.log('检测到无效的信道 IDs =>', invalidTunnelIds)
        // 从 userMap 和 connectedTunnelIds 中将无效的信道记录移除
        invalidTunnelIds.forEach(tunnelId => {
          delete userMap[tunnelId]
          const index = connectedTunnelIds.indexOf(tunnelId)
          if (~index) {
            connectedTunnelIds.splice(index, 1)
          }
        })
      }
    })
}

/**
 * 调用 tunnel.closeTunnel() 关闭信道
 * @param  {String} tunnelId 信道ID
 */

const $close = (tunnelId) => {
  tunnel.closeTunnel(tunnelId)
}

/**
 * 实现 onConnect 方法
 * 在信道连接建立以后会调用本方法
 */

function onConnect(tunnelId) {
  console.log(`[onConnect] =>`, { tunnelId })
}

/**
 * 实现 onClose 方法
 * 在连接被关闭（包括主动关闭和被动关闭）以后会调用本方法
 * 此时可以进行清理及通知操作
 */

function onClose(tunnelId) {
  console.log(`[onClose] =>`, { tunnelId })
}

/**
 * 实现 onMessage 方法
 * 客户端推送消息到信道服务器以后会调用本方法，此时可以处理信道消息
 */

function onMessage(tunnelId, type, content) {
  console.log(`[onMessage] =>`, { tunnelId, type, content })
  switch (type) {
    case TunnelEvent.QUICK_MATCH_REQ:
      pub.publish(TunnelEvent.QUICK_MATCH_REQ, JSON.stringify(content))
      break
    default:
      break
  }
}

/* ================================================================================ */

module.exports = {

  /*
   * 响应客户端的信道连接请求，信道服务器连接成功以后通知客户端
   */

  get: async ctx => {
    const data = await tunnel.getTunnelUrl(ctx.req)
    const tunnelInfo = data.tunnel
    console.log(`get tunnel: `, tunnelInfo)
    ctx.state.data = tunnelInfo
  },

  /*
   * 处理信道传递过来的消息
   */

  post: async ctx => {
    // 当用户发送消息到信道上时，使用 onTunnelMessage 处理信道上的消息
    const packet = await tunnel.onTunnelMessage(ctx.request.body)
    console.log(`receive a tunnel packet: `, packet)
    switch (packet.type) {
      case 'connect':
        onConnect(packet.tunnelId)
        break
      case 'close':
        onClose(packet.tunnelId)
        break
      case 'message':
        onMessage(packet.tunnelId, packet.content.messageType, packet.content.messageContent)
        break
    }
  }

}
