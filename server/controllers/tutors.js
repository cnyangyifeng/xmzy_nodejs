const { uploader } = require('../qcloud')
const coredb = require('../services/coredb')
const moment = require('moment')
const uuidGenerator = require('uuid/v4')

/* ================================================================================ */

/**
 * Tutor
 *  - tutorId
 *  - tutorInfo
 *  - salary
 *  - praises
 */

async function getTutor(ctx, next) {
  if (ctx.state.$wxInfo.loginState === 1) {
    ctx.state.data =
      await coredb('tutor')
        .first()
  } else {
    // 登录态已过期
    ctx.state.code = -1
  }
}

async function getTutorByTutorId(ctx, next) {
  const tutorId = ctx.params.tutor_id
  ctx.state.data =
    await coredb('tutor')
      .first()
      .where('tutorId', tutorId)
}

/* ================================================================================ */

module.exports = {
  getTutor,
  getTutorByTutorId
}