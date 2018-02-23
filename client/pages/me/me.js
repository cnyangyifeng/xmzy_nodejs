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

  /**
   * 监听页面显示
   */

  onShow: function () {
    if (!this.data.userInfo) {
      this.updateUserInfo()
    }
  },

  /**
   * 绑定事件：点击登录按钮
   */

  loginButtonTap: function () {
    loginService.ensureLoggedIn().then(
      this.updateUserInfo,
      this.loginFail
    )
  },

  /**
   * 绑定事件：点击 “设置” 菜单
   */

  setupCellTap: function () {
    wx.openSetting()
  },

  /**
   * 更新页面数据 userInfo
   */

  updateUserInfo: function () {
    this.setData({
      userInfo: UserInfo.get()
    })
  },

  /**
   * 处理登录失败
   */

  loginFail: function () {
    console.log(msgs.login_fail_title)
  }

})
