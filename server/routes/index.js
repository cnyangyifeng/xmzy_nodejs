// ajax 服务路由集合
const router = require('koa-router')({
  prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

// --- students --- //
router.get('/student', validationMiddleware, controllers.students.getStudent)
router.get('/students/:student_id', controllers.students.getStudentByStudentId)
router.post('/student/grade_id/:grade_id', validationMiddleware, controllers.students.postGradeId)

// --- tutors --- //
router.get('/tutor', validationMiddleware, controllers.tutors.getTutor)
router.get('/tutors/:tutor_id', controllers.tutors.getTutorByTutorId)

// --- activities --- //
router.get('/activities', validationMiddleware, controllers.activities.getMyActivities)
router.get('/activities/:activity_id', controllers.activities.getActivityByActivityId)
router.post('/activities', validationMiddleware, controllers.activities.postActivity)

// --- assignments --- //
router.get('/activities/:activity_id/assignments', controllers.assignments.getAssignmentsByActivityId)
router.get('/activities/:activity_id/assignments/:assignment_id', controllers.assignments.getAssignmentByActivityIdAndAssignmentId)
router.post('/activities/:activity_id/assignments', validationMiddleware, controllers.assignments.postAssignmentWithActivityId)

// --- xmessages --- //
router.get('/activities/:activity_id/assignments/:assignment_id/xmessages', controllers.xmessages.getXmessagesByActivityIdAndAssignmentId)
router.post('/activities/:activity_id/assignments/:assignment_id/xmessages', validationMiddleware, controllers.xmessages.postXmessageWithActivityIdAndAssignmentId)

module.exports = router
