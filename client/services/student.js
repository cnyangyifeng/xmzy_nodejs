const STUDENT_KEY = 'student'

var Student = {

  get: function () {
    return wx.getStorageSync(STUDENT_KEY) || null
  },

  set: function (session) {
    wx.setStorageSync(STUDENT_KEY, session)
  },

  clear: function () {
    wx.removeStorageSync(STUDENT_KEY)
  }

}

module.exports = Student