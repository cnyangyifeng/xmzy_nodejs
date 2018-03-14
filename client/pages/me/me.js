const configs = require('../../config')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const Student = require('../../services/student')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    student: null, // 当前 student
  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function (options) {
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

  /* ================================================================================ */

  /**
   * 绑定事件：点击 unloggedCell
   */

  unloggedCellTap: function () {
    console.log(`点击 unloggedCell`)
    loginService.ensureLoggedIn().then(
      // 从本地缓存中读取 student，更新页面数据 student
      () => this.setData({
        student: Student.get()
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
  },

  /**
   * 绑定事件：点击 reviewsCell
   */

  reviewsCellTap: function () {
    console.log(`点击 reviewsCell`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../pages/reviews/reviews`
      })
    )
  },

  /**
   * 绑定事件：点击 purchaseCellCell
   */

  purchaseCellTap: function () {
    console.log(`点击 purchaseCellTapCell`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../packages/my/pages/purchase/purchase`
      })
    )
  },

  /**
   * 绑定事件：点击 ccCell
   */

  ccCellTap: function () {
    console.log(`点击 ccCell`)
    wx.clearStorageSync()
    wx.showToast({
      title: 'Clear Storage',
      image: '/assets/images/warning.png',
      mask: true
    })
  },

  /**
   * 绑定事件：点击 setupCell
   */

  setupCellTap: function () {
    console.log(`点击 setupCell`)
    wx.openSetting()
  }

})
