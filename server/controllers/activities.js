const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

/* ================================================================================ */

/**
 * activity
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
 */

async function getMyActivities(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const pageNo = Number.parseInt(ctx.request.query['page_no'])
    const limit = 3
    const offset = pageNo * limit
    const endTime = moment().subtract(offset, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
    const startTime = moment().subtract(offset + limit, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
    console.log(`===========> ${startTime} ${endTime}`)
    ctx.state.data =
      await coredb('activity')
        .select()
        .whereRaw('studentId = ? and createTime between ? and ?', [studentId, startTime, endTime])
        .orderBy('createTime', 'desc')
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getActivityByActivityId(ctx, next) {
  const activityId = ctx.params.activity_id
  const activity =
    await coredb('activity')
      .first()
      .where('activityId', activityId)
  let assignment
  if (activity.currentAssignmentId) {
    assignment =
      await coredb('assignment')
        .first()
        .where('assignmentId', activity.currentAssignmentId)
    if (assignment === undefined) {
      assignment = await createDefaultAssignment(activity)
    }
  } else {
    assignment = await createDefaultAssignment(activity)
  }
  activity['currentAssignment'] = JSON.stringify(assignment)
  ctx.state.data = activity
}

async function postActivity(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = uuidGenerator()
    const disciplineId = ctx.request.query['discipline_id']
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const studentInfo = JSON.stringify(ctx.state.$wxInfo.userinfo)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('activity')
      .insert({
        activityId: activityId,
        disciplineId: disciplineId,
        studentId: studentId,
        studentInfo: studentInfo,
        createTime: createTime,
        lastVisitTime: lastVisitTime
      })
    ctx.state.data = activityId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

/* ================================================================================ */

/**
 * 创建一条默认的 assignment 数据
 */
async function createDefaultAssignment(activity) {
  const assignmentId = uuidGenerator()
  const activityId = activity.activityId
  const senderId = JSON.parse(activity.studentInfo).openId
  const senderInfo = JSON.stringify(activity.studentInfo)
  const defaultImageData = '{\"imgUrl\":\"http://xmzy-1252644202.cosgz.myqcloud.com/system_data/1519492572474-H1VJ0fyOf.jpg\",\"size\":99819,\"mimeType\":\"image/jpeg\",\"name\":\"1519492572474-H1VJ0fyOf.jpg\",\"fileBucket\":\"xmzy\",\"qcloudAppId\":\"1252644202\",\"region\":\"ap-guangzhou\",\"uploadFolder\":\"system_data/\",\"imgKey\":\"1519492572474-H1VJ0fyOf.jpg\"}'
  const createTime = activity.createTime
  const lastVisitTime = activity.lastVisitTime
  await coredb('assignment')
    .insert({
      assignmentId: assignmentId,
      activityId: activityId,
      senderId: senderId,
      senderInfo: senderInfo,
      imageData: defaultImageData,
      createTime: createTime,
      lastVisitTime: lastVisitTime
    })
  await coredb('activity')
    .update('currentAssignmentId', assignmentId)
    .where('activityId', activityId)
  return await coredb('assignment')
    .first()
    .where('assignmentId', assignmentId)
}

/* ================================================================================ */

module.exports = {
  getMyActivities,
  getActivityByActivityId,
  postActivity
}