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
    hearts: 64,
    diamonds: 2048
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
   * 绑定事件：点击 unloggedCell
   */

  unloggedCellTap: function () {
    console.log(`点击 unloggedCell`)
    loginService.ensureLoggedIn().then(
      // 从本地缓存中读取 userInfo，更新页面数据 userInfo
      () => this.setData({
        userInfo: UserInfo.get()
      })
    )
  },

  /**
   * 绑定事件：点击 userInfoCell
   */

  userInfoCellTap: function () {
    console.log(`点击 userInfoCell`)
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
      image: '/assets/images/fail.png',
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
