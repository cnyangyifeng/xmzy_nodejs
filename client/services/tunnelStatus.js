/*
 * 信道事件处理机制
 * 信道事件包括：
 *   connect      - 连接已建立
 *   close        - 连接被关闭（包括主动关闭和被动关闭）
 *   reconnecting - 开始重连
 *   reconnect    - 重连成功
 *   error        - 发生错误，其中包括连接失败、重连失败、解包失败等等
 *   [message]    - 信道服务器发送过来的其它事件类型，如果事件类型和上面内置的事件类型冲突，将在事件类型前面添加前缀 `@`
 */

const TunnelStatus = {
  CONNECT: 'connect',
  CLOSE: 'close',
  RECONNECTING: 'reconnecting',
  RECONNECT: 'reconnect',
  ERROR: 'error'
}

module.exports = TunnelStatus