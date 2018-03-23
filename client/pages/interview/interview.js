const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const matchService = require('../../services/matchService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const Student = require('../../services/student')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    grades: [
      { id: 'p', name: '小学' }, // primary
      { id: 'j', name: '初中' }, // junior
      { id: 's', name: '高中' } // senior
    ],
    gradeSelectorHidden: true,

    disciplineId: '', // 当前 disciplineId
    student: null, // 当前 student
    tutor: null // 当前 tutor
  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function (options) {
    // 从 URL 中读取 discipline_id 参数，更新页面数据 disciplineId
    this.setData({
      disciplineId: options.discipline_id
    })
    // 设置页面标题
    const disciplineName = disciplines.find(e => {
      return e.id === this.data.disciplineId
    }).name
    wx.setNavigationBarTitle({
      title: `${disciplineName}作业`
    })
  },

  /**
   * 监听页面初次渲染完成
   */

  onReady: function () {

  },

  /**
   * 监听页面显示
   */

  onShow: function (options) {
    // 从本地缓存中读取 student，更新页面数据 student
    this.setData({
      student: Student.get()
    })

    // 如果是首次访问学员，则显示 grade-selector 浮层
    // setTimeout(() => {
    //   // if (!this.data.student.gradeId || this.data.student.gradeId.length === 0) {
    //   if (this.data.student.firstVisit) {
    //     this.setData({
    //       gradeSelectorHidden: false
    //     })
    //   }
    // }, 6000)

    // 从 tutor queue 中取出一个 tutor
    // this.shiftTutor()

    // 开始师生匹配
    matchService.match(this, getApp(), options)
  },

  /* ================================================================================ */

  /**
   * 点击 enterButton
   */

  enterButtonTap: function () {
    console.log(`点击 enterButton`)
    loginService.ensureLoggedIn().then(
      () => this.getActivity(this.data.disciplineId)
    )
  },

  /**
   * 点击 refreshButton
   */

  refreshButtonTap: function () {
    console.log(`点击 refreshButton`)
    this.discardTutor()
    this.shiftTutor()
  },

  /**
   * 点击 addHeartButton
   */

  addHeartButtonTap: function () {
    console.log(`点击 addHeartButton`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../packages/my/pages/purchase/purchase`
      })
    )
  },

  /**
   * 点击 gradeButton
   */

  gradeButtonTap: function (e) {
    console.log(`点击 gradeButton`)
    const gradeId = e.currentTarget.dataset.gradeId
    loginService.ensureLoggedIn().then(
      // 提交当前 student 的 grade
      this.postGradeId(gradeId)
    )
  },

  /* ================================================================================ */

  /**
   * 分配一个 tutor
   */

  shiftTutor: function () {
    console.log(`shift tutor`)
    // 分配一个 tutor
    qcloud.request({
      url: `${configs.weapp}/tutor`,
      login: true,
      success: res => {
        const tutor = res.data.data
        console.log(tutor)
        if (tutor && JSON.stringify(tutor) !== '{}') {
          const tutorInfo = JSON.parse(tutor.tutorInfo)
          tutor.tutorInfo = tutorInfo
          this.setData({
            tutor: tutor
          })
        } else {
          this.setData({
            tutor: {}
          })
        }
      },
      fail: err => {
        this.setData({
          tutor: {}
        })
        // 请求失败，则显示失败消息提示框
        wx.showToast({
          title: msgs.request_fail_title,
          image: '/assets/images/warning.png',
          mask: true
        })
      }
    })
  },

  /**
   * 放弃当前 tutor
   */

  discardTutor: function () {
    console.log(`discard tutor`)
    this.setData({
      tutor: null
    })
  },

  /**
   * 获取一条 activity 数据
   */

  getActivity: function (disciplineId) {
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.enter_classroom_processing_title,
      mask: true
    })
    // 创建一条 activity 数据
    qcloud.request({
      url: `${configs.weapp}/activities?discipline_id=${disciplineId}`,
      login: true,
      method: 'post',
      success: res => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 重新启动至 activity 页面
        wx.reLaunch({
          url: `../activity/activity?activity_id=${res.data.data}`
        })
      },
      fail: err => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 请求失败，则显示失败弹窗
        wx.showModal({
          title: msgs.enter_classroom_fail_title,
          content: msgs.contact_us_to_report_bugs,
          showCancel: false
        })
      }
    })
  },

  /**
   * 提交当前 student 的 gradeId
   */

  postGradeId: function (gradeId) {
    console.log(`提交当前 student 的 gradeId: ${gradeId}`)
    // 隐藏 grade-selector 浮层
    this.setData({
      gradeSelectorHidden: true
    })
    // 创建一条 activity 数据
    qcloud.request({
      url: `${configs.weapp}/student/grade_id/${gradeId}`,
      login: true,
      method: 'post',
      success: res => {
        // 更新当前 student 的 gradeId
        const student = this.data.student
        student.gradeId = res.data.data
        // 更新本地缓存数据 student
        Student.set(student)
        // 更新页面数据 student
        this.setData({
          student: student
        })
      },
      fail: err => {
        // 请求失败，则显示失败消息提示框
        wx.showToast({
          title: msgs.request_fail_title,
          image: '/assets/images/warning.png',
          mask: true
        })
      }
    })
  }

})