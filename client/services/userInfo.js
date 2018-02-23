const USER_INFO_KEY = 'userInfo'

var UserInfo = {

  get: function () {
    return wx.getStorageSync(USER_INFO_KEY) || null
  },

  set: function (session) {
    wx.setStorageSync(USER_INFO_KEY, session)
  },

  clear: function () {
    wx.removeStorageSync(USER_INFO_KEY)
  }

}

module.exports = UserInfo