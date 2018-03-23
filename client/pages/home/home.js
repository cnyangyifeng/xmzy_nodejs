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
    disciplines: [], // 学科列表
    student: null, // 当前 student
  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function (options) {
    this.setData({
      disciplines: disciplines
    })
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
      path: `pages/home/home`,
      success: res => {
        console.log(`转发成功`)
      },
      fail: err => {
        console.log(`取消转发`)
      }
    }
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 grid
   */

  gridTap: function (e) {
    console.log(`点击 grid`)
    const disciplineId = e.currentTarget.dataset.disciplineId
    loginService.ensureLoggedIn().then(
      () => this.getActivity(disciplineId)
    )
  },

  gridTap2: function (e) {
    console.log(`点击 grid`)
    const disciplineId = e.currentTarget.dataset.disciplineId
    // 跳转至 navigator 页面
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../navigator/navigator?discipline_id=${disciplineId}`,
      })
    )
  },

  /* ================================================================================ */

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
  }

})
