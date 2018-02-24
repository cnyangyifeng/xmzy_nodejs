const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const moment = require('../../utils/moment-with-locales.min.js')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')

Page({

  /**
   * 页面的初始数据
   */

  data: {

    /* 当前用户相关的 Activities */

    activities: [],

    /* 即将请求的 Activities 数据分页页码 */

    pageNo: 0

  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function () {
    // Moment 本地化
    moment.locale('zh-cn')
  },

  /**
   * 监听页面显示
   */

  onShow: function () {
    loginService.ensureLoggedIn().then(
      this.getActivities
    )
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 Activity Cell
   */

  activityCellTap: function (e) {
    const activityId = e.currentTarget.dataset.activityId
    console.log(`activity cell tap, activityId: ${activityId}`)
    loginService.ensureLoggedIn().then(
      () => wx.navigateTo({
        url: `../activity/activity?activity_id=${activityId}`
      })
    )
  },

  /* ================================================================================ */

  /**
   * 获取当前用户相关的 Activities
   */

  getActivities: function () {
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.loading_title,
      mask: true
    })
    // 获取 Activities
    qcloud.request({
      url: `${configs.weapp}/activities?page_no=${this.data.pageNo}`,
      login: true,
      success: res => {
        const arr = res.data.data // Activities 原始数据
        if (arr.length > 0) {
          let activities = [], map = {}
          for (let i = 0; i < arr.length; i++) {
            let item = arr[i]
            // 为 item 动态增加一个 disciplineName 属性/值，用于页面显示
            item['disciplineName'] = disciplines.find(e => {
              return e.id === item.disciplineId
            }).name
            const createDate = moment(item.createTime).format('YYYY年MMMDo dddd')
            if (!map[createDate]) {
              activities.push({
                createDate: createDate,
                data: [item]
              })
              map[createDate] = item
            } else {
              for (let j = 0; j < activities.length; j++) {
                const activity = activities[j]
                if (activity.createDate === createDate) {
                  activity.data.push(item)
                  break
                }
              }
            }
          }
          // 追加 Activities
          const tmp = this.data.activities.concat(activities)
          this.setData({
            activities: tmp
          })
          // 更新数据分页页码
          const pageNo = this.data.pageNo + 1
          this.setData({
            pageNo: pageNo
          })
        }
        // 隐藏 loading 提示框
        wx.hideLoading()
      },
      fail: err => {
        // 隐藏 loading 提示框
        wx.hideLoading()
      }
    })
  }

})