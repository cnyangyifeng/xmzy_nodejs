const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const UserInfo = require('../../services/userInfo')

Page({

  /**
   * 页面的初始数据
   */

  data: {

    /* 学科列表 */

    disciplines: [],

    /* 用户信息 */

    userInfo: null,

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
    if (!this.data.userInfo) {
      // 从本地缓存中读取 userInfo，更新页面数据 userInfo
      this.setData({
        userInfo: UserInfo.get()
      })
    }
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 Grid
   */

  gridTap: function (e) {
    console.log(`grid cell tap`)
    const disciplineId = e.currentTarget.dataset.disciplineId
    loginService.ensureLoggedIn().then(
      () => this.getActivity(disciplineId)
    )
  },

  gridTap2: function (e) {
    console.log(`grid cell tap`)
    const disciplineId = e.currentTarget.dataset.disciplineId
    // 跳转至 Waiting Room 页面
    wx.navigateTo({
      url: `../waitingRoom/waitingRoom`,
    })
  },

  /* ================================================================================ */

  /**
   * 获取一条 Activity 数据
   */

  getActivity: function (disciplineId) {
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.enter_classroom_processing_title,
      mask: true
    })
    // 创建一条 Activity 数据
    qcloud.request({
      url: `${configs.weapp}/activities?discipline_id=${disciplineId}`,
      login: true,
      method: 'post',
      success: res => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 重新启动至 Activity 页面
        wx.reLaunch({
          url: `../activity/activity?activity_id=${res.data.data}`
        })
      },
      fail: err => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 显示 “进入教室失败” 弹窗
        wx.showModal({
          title: msgs.enter_classroom_fail_title,
          content: msgs.contact_us_to_report_bugs,
          showCancel: false
        })
      }
    })
  }

})
