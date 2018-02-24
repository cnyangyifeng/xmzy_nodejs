const configs = require('../../config')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const UserInfo = require('../../services/userInfo')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    userInfo: null, // 用户信息
    vouchersCount: 49 // 熊猫券的数量
  },

  /* ================================================================================ */

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
   * 绑定事件：点击 Unlogged Cell
   */

  unloggedCellTap: function () {
    loginService.ensureLoggedIn().then(
      // 从本地缓存中读取 userInfo，更新页面数据 userInfo
      () => this.setData({
        userInfo: UserInfo.get()
      })
    )
  },

  /**
   * 绑定事件：点击 UserInfo Cell
   */

  userInfoCellTap: function () {
    console.log(`userInfo cell tap`)
  },

  /**
   * 绑定事件：点击 Reviews Cell
   */

  reviewsCellTap: function () {
    console.log(`reviews cell tap`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../pages/reviews/reviews`
      })
    )
  },

  /**
   * 绑定事件：点击 ServicePlans Cell
   */

  servicePlansCellTap: function () {
    console.log(`servicePlans cell tap`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../../packages/my/pages/servicePlans/servicePlans`
      })
    )
  },

  /**
   * 绑定事件：点击 CC Cell
   */

  ccCellTap: function () {
    console.log(`cc cell tap`)
    wx.clearStorageSync()
    wx.showToast({
      title: 'Clear Storage',
      image: '/assets/images/fail.png',
      mask: true
    })
  },

  /**
   * 绑定事件：点击 Setup Cell
   */

  setupCellTap: function () {
    console.log(`setup cell tap`)
    wx.openSetting()
  }

})
