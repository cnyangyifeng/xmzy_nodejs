const configs = require('../../config')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const Student = require('../../services/student')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    student: null // 当前 student
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
  },

  /**
   * 绑定事件：点击 tutorModeSwitch
   */

  tutorModeSwitchTap: function (e) {
    console.log(`点击 tutorModeSwitch`)
    const tutorMode = e.detail.value ? 1 : 0
    loginService.ensureLoggedIn().then(() => {
      // 从本地缓存中读取 student，更新页面数据 student
      this.setData({
        student: Student.get()
      })
      // 提交当前 student 的 tutorMode
      this.postTutorMode(tutorMode).then(() => {
        // 根据当前 student 的 tutorMode 重新调整页面
        if (tutorMode) {
          // 设置 tabBarItem
          wx.setTabBarItem({
            index: 0,
            text: '消息',
            iconPath: '/assets/images/messages.png',
            selectedIconPath: '/assets/images/messages_fill.png'
          })
        } else {
          // 设置 tabBarItem
          wx.setTabBarItem({
            index: 0,
            text: '作业',
            iconPath: '/assets/images/home.png',
            selectedIconPath: '/assets/images/home_fill.png'
          })
        }
      })
    })
  },

  /* ================================================================================ */

  /**
   * 提交当前 student 的 tutorMode
   */

  postTutorMode: function (tutorMode) {
    console.log(`提交当前 student 的 tutorMode`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_title,
        mask: true
      })
      // 提交当前 student 的 tutorMode
      qcloud.request({
        url: `${configs.weapp}/student/tutor_mode/${tutorMode}`,
        login: true,
        method: 'post',
        success: res => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 更新当前 student 的 tutorMode
          const student = this.data.student
          student.tutorMode = res.data.data
          // 更新本地缓存数据 student
          Student.set(student)
          // 更新页面数据 student
          this.setData({
            student: student
          })
          // 操作成功
          resolve()
        },
        fail: err => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 请求失败，则显示失败消息提示框
          wx.showToast({
            title: msgs.request_fail_title,
            image: '/assets/images/warning.png',
            mask: true
          })
          // 操作失败
          reject()
        }
      })
    })
  }

})
