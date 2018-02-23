const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

async function getXmessagesByActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    ctx.state.data = await coredb('xmessage').select().where('activity_id', activityId)
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getAudioDataByXmessageId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const xmessageId = ctx.params.xmessage_id
    const result = await coredb('xmessage').first().where('xmessage_id', xmessageId)
    const { audio_data: audioData } = result
    ctx.state.data = audioData
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function postXmessageWithActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    // 上传文件至 COS
    const result = await uploader(ctx.req)
    // 创建一条 Xmessage 数据
    const xmessageId = uuidGenerator()
    const activityId = ctx.params.activity_id
    const userId = ctx.state.$wxInfo.userinfo.openId
    const audioData = JSON.stringify(result)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('xmessage').insert({ xmessage_id: xmessageId, activity_id: activityId, user_id: userId, audio_data: audioData, create_time: createTime, last_visit_time: lastVisitTime })
    // 返回 Xmessage Id
    ctx.state.data = xmessageId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

module.exports = {
  getXmessagesByActivityId,
  getAudioDataByXmessageId,
  postXmessageWithActivityId
}