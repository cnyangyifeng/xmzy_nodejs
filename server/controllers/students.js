const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

/* ================================================================================ */

/**
 * Student
 *  - studentId
 *  - studentInfo
 *  - stars
 *  - hearts
 */
async function getStudentByStudentId(ctx, next) {
  const studentId = ctx.params.student_id
  ctx.state.data =
    await coredb('student')
      .first()
      .where('studentId', studentId)
}

async function postStudent(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const studentInfo = JSON.stringify(ctx.state.$wxInfo.userinfo)
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const lastVisitTime = createTime
    ctx.state.data =
      await coredb('student')
        .insert({
          studentId: studentId,
          studentId: studentId,
          studentInfo: studentInfo,
          createTime: createTime,
          lastVisitTime: lastVisitTime
        })
        .returning('studentId')
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

/* ================================================================================ */

module.exports = {
  getStudentByStudentId,
  postStudent
}