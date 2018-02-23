const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

async function getActivities(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentId = ctx.state.$wxInfo.userinfo.openId
    ctx.state.data = await coredb('activity').select().where('student_id', studentId)
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getActivityByActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    ctx.state.data = await coredb('activity').first().where('activity_id', activityId)
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getAssignmentsCountByActivityId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    const result = await coredb('activity').first().where('activity_id', activityId)
    const { assignments_count: assignmentsCount } = result
    ctx.state.data = assignmentsCount
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
    const tutorId = 'tbd'
    const assignmentsCount = 0
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('activity').insert({ activity_id: activityId, discipline_id: disciplineId, student_id: studentId, tutor_id: tutorId, assignments_count: assignmentsCount, create_time: createTime, last_visit_time: lastVisitTime })
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
  getAssignmentsCountByActivityId,
  postActivity
}