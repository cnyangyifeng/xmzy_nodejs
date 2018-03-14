const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const Student = require('../../services/student')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    disciplineId: '', // 当前 disciplineId
    student: null, // 当前 student
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

  onShow: function () {
    // 从本地缓存中读取 student，更新页面数据 student
    this.setData({
      student: Student.get()
    })
  },

  /**
   * 用户点击右上角转发
   */

  onShareAppMessage: function () {
    // 设置转发信息
    return {
      path: `pages/interview/interview?discipline_id=${this.data.disciplineId}`,
      success: res => {
        console.log(`转发成功`)
        // 跳转至 interview 页面
        loginService.ensureLoggedIn().then(
          () => wx.navigateTo({
            url: `../interview/interview?discipline_id=${this.data.disciplineId}`,
          })
        )
      },
      fail: err => {
        console.log(`取消转发`)
      }
    }
  },

  /* ================================================================================ */

  /**
   * 点击 favoriteTutorsCell
   */

  favoriteTutorsCellTap: function () {
    console.log(`点击 favoriteTutorsCell`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../favorites/favorites?student_id=${this.data.student.studentId}`,
      })
    )
  },

  /**
   * 点击 quickMatchCell
   */

  quickMatchCellTap: function () {
    console.log(`点击 quickMatchCell`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../interview/interview?discipline_id=${this.data.disciplineId}`,
      })
    )
  },

  /**
   * 点击 contactedTutorsCell
   */

  contactedTutorsCellTap: function () {
    console.log(`点击 contactedTutorsCell`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../pages/reviews/reviews`
      })
    )
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
  }

})