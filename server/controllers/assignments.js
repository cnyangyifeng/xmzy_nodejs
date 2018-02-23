const DEFAULT_IMAGE_DATA = `{"imgUrl":"https://xmzy-1252644202.cos.ap-guangzhou.myqcloud.com/weapp/bg.jpg"}`

const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

async function getImageDataByActivityIdAndSerialNumber(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const activityId = ctx.params.activity_id
    const serialNumber = Number.parseInt(ctx.params.serial_number)
    const result = await coredb('assignment').first().where({ 'activity_id': activityId, 'serial_number': serialNumber })
    if (result === undefined) {
      ctx.state.data = DEFAULT_IMAGE_DATA
    } else {
      const { image_data: imageData } = result
      ctx.state.data = imageData
    }
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function postAssignmentWithActivityIdAndSerialNumber(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    // 上传文件至 COS
    const result = await uploader(ctx.req)
    // 创建一条 Assignment 数据
    const assignmentId = uuidGenerator()
    const activityId = ctx.params.activity_id
    const serialNumber = Number.parseInt(ctx.params.serial_number)
    const userId = ctx.state.$wxInfo.userinfo.openId
    const imageData = JSON.stringify(result)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    await coredb('assignment').insert({ assignment_id: assignmentId, activity_id: activityId, serial_number: serialNumber, user_id: userId, image_data: imageData, create_time: createTime, last_visit_time: lastVisitTime })
    // 更新 Activity 中的 Assignments Count
    const assignmentsCount = serialNumber + 1
    await coredb('activity').update('assignments_count', assignmentsCount).where('activity_id', activityId)
    // 返回 Assignment Id
    ctx.state.data = assignmentId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

module.exports = {
  getImageDataByActivityIdAndSerialNumber,
  postAssignmentWithActivityIdAndSerialNumber
}