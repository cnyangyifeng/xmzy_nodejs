const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

/* ================================================================================ */

/**
 * assignment (key: currentAssignmentId)
 *  - assignmentId
 *  - activityId
 *  - senderId
 *  - senderInfo (key: openId)
 *  - xmStatus
 *  - imageData
 *  - createTime
 *  - lastVisitTime
 */

async function getAssignmentsByActivityId(ctx, next) {
  const activityId = ctx.params.activity_id
  ctx.state.data =
    await coredb('assignment')
      .select()
      .where('activityId', activityId)
}

async function getAssignmentByActivityIdAndAssignmentId(ctx, next) {
  const activityId = ctx.params.activity_id
  const assignmentId = ctx.params.assignment_id
  ctx.state.data =
    await coredb('assignment')
      .first()
      .where({
        'activityId': activityId,
        'assignmentId': assignmentId
      })
}

async function postAssignmentWithActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    // 上传文件至 COS
    const result = await uploader(ctx.req)
    // 创建一条 assignment 数据
    const assignmentId = uuidGenerator()
    const activityId = ctx.params.activity_id
    const senderId = ctx.state.$wxInfo.userinfo.openId
    const senderInfo = JSON.stringify(ctx.state.$wxInfo.userinfo)
    const imageData = JSON.stringify(result)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('assignment')
      .insert({
        assignmentId: assignmentId,
        activityId: activityId,
        senderId: senderId,
        senderInfo: senderInfo,
        imageData: imageData,
        createTime: createTime,
        lastVisitTime: lastVisitTime
      })
    await coredb('activity')
      .update('currentAssignmentId', assignmentId)
      .where('activityId', activityId)
    // 返回 assignmentId
    ctx.state.data = assignmentId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

/* ================================================================================ */

module.exports = {
  getAssignmentsByActivityId,
  getAssignmentByActivityIdAndAssignmentId,
  postAssignmentWithActivityId
}