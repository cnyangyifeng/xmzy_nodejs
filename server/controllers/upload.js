const { uploader } = require('../qcloud')

module.exports = async ctx => {
  // 获取上传之后的结果
  const data = await uploader(ctx.req)
  ctx.state.data = data
}
