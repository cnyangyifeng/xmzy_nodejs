const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

async function getXmessagesByActivityIdAndAssignmentId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    const assignmentId = ctx.params.assignment_id
    ctx.state.data = await coredb('xmessage').select().where({ 'activityId': activityId, 'assignmentId': assignmentId })
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function postXmessageWithActivityIdAndAssignmentId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    // 上传文件至 COS
    const result = await uploader(ctx.req)
    // 创建一条 Xmessage 数据
    const xmessageId = uuidGenerator()
    const activityId = ctx.params.activity_id
    const assignmentId = ctx.params.assignment_id
    const senderId = ctx.state.$wxInfo.userinfo.openId
    const senderInfo = JSON.stringify(ctx.state.$wxInfo.userinfo)
    const audioData = JSON.stringify(result)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('xmessage').insert({ xmessageId: xmessageId, activityId: activityId, assignmentId: assignmentId, senderId: senderId, senderInfo: senderInfo, audioData: audioData, createTime: createTime, lastVisitTime: lastVisitTime })
    // 返回 Xmessage Id
    ctx.state.data = xmessageId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

module.exports = {
  getXmessagesByActivityIdAndAssignmentId,
  postXmessageWithActivityIdAndAssignmentId
}