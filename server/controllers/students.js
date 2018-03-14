const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

/* ================================================================================ */

/**
 * Student
 *  - studentId
 *  - studentInfo
 *  - hearts
 *  - diamonds
 */

async function getStudent(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentInfo = ctx.state.$wxInfo.userinfo
    const student =
      await coredb('student')
        .first()
        .where('studentId', studentInfo.openId)
    if (student === undefined) {
      student = await createDefaultStudent(studentInfo)
    }
    ctx.state.data = student
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getStudentByStudentId(ctx, next) {
  const studentId = ctx.params.student_id
  ctx.state.data =
    await coredb('student')
      .first()
      .where('studentId', studentId)
}

async function postGradeId(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    const studentId = ctx.state.$wxInfo.userinfo.openId
    const gradeId = ctx.params.grade_id
    await coredb('student')
      .update({
        gradeId: gradeId
      })
      .where('studentId', studentId)
    ctx.state.data = gradeId
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

/* ================================================================================ */

/**
 * 创建一条默认的 student 数据
 */
async function createDefaultStudent(studentInfo) {
  const studentId = studentInfo.openId
  const createTime = moment().format('YYYY-MM-DD HH:mm:ss')
  const lastVisitTime = createTime
  await coredb('student')
    .insert({
      studentId: studentId,
      studentInfo: JSON.stringify(studentInfo),
      createTime: createTime,
      lastVisitTime: lastVisitTime
    })
  return await coredb('student')
    .first()
    .where('studentId', studentId)
}

/* ================================================================================ */

module.exports = {
  getStudent,
  getStudentByStudentId,
  postGradeId
}