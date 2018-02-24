const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

async function getActivities(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const pageNo = Number.parseInt(ctx.request.query['page_no'])
    const limit = 10
    const offset = pageNo * limit
    ctx.state.data = await coredb('activity').select().where('studentId', studentId).orderBy('createTime', 'desc').limit(limit).offset(offset)
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

/**
 * 
 * Activity
 *  - activityId
 *  - disciplineId
 *  - studentId
 *  - studentInfo (key: openId)
 *  - tutorId
 *  - tutorInfo (key: openId)
 *  - status
 *  - currentAssignmentId
 *  - currentAssignment (key: currentAssignmentId)
 *    - assignmentId
 *    - activityId
 *    - senderId
 *    - senderInfo (key: openId)
 *    - xmStatus
 *    - imageData
 *    - createTime
 *    - lastVisitTime
 *  - createTime
 *  - lastVisitTime
 * 
 */

async function getActivityByActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    const activity = await coredb('activity').first().where('activityId', activityId)
    const assignment = await coredb('assignment').first().where('assignmentId', activity.currentAssignmentId)
    assignment != undefined
      ? activity['currentAssignment'] = JSON.stringify(assignment)
      : activity['currentAssignment'] = null
    ctx.state.data = activity
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function postActivity(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = uuidGenerator()
    const disciplineId = ctx.request.query['discipline_id']
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const studentInfo = JSON.stringify(ctx.state.$wxInfo.userinfo)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('activity').insert({ activityId: activityId, disciplineId: disciplineId, studentId: studentId, studentInfo: studentInfo, createTime: createTime, lastVisitTime: lastVisitTime })
    // 返回 Activity Id
    ctx.state.data = activityId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

module.exports = {
  getActivities,
  getActivityByActivityId,
  postActivity
}