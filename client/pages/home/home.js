const configs = require('../../config')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    disciplines: [{
      id: 'chinese',
      name: '语文'
    }, {
      id: 'maths',
      name: '数学'
    }, {
      id: 'english',
      name: '英语'
    }, {
      id: 'physics',
      name: '物理'
    }, {
      id: 'chemistry',
      name: '化学'
    }, {
      id: 'biology',
      name: '生物'
    }, {
      id: 'politics',
      name: '政治'
    }, {
      id: 'history',
      name: '历史'
    }, {
      id: 'geography',
      name: '地理'
    }]
  },

  /**
   * 绑定事件：点击 Grid
   */

  gridTap: function (e) {
    console.log(`grid cell tap`)
    const disciplineId = e.currentTarget.dataset.disciplineId
    loginService.ensureLoggedIn().then(
      () => this.requestActivity(disciplineId)
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

  /**
   * 创建或更新一条 Activity 数据
   */

  requestActivity: function (disciplineId) {
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
