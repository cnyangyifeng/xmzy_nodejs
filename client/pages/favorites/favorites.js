const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const moment = require('../../utils/moment-with-locales.min.js')
const qcloud = require('../../vendor/wafer2-client-sdk/index')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    loading: true, // 数据加载状态
    activities: [], // 当前用户相关的 activities
    pageNo: 0, // 即将请求的 activities 数据分页页码
  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function () {
    // moment 本地化
    moment.locale('zh-cn')
  },

  /**
   * 监听页面显示
   */

  onShow: function () {
    loginService.ensureLoggedIn().then(
      () => this.getMyActivities(0)
    )
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 activityCell
   */

  activityCellTap: function (e) {
    const activityId = e.currentTarget.dataset.activityId
    console.log(`点击 activityCell, activityId: ${activityId}`)
    loginService.ensureLoggedIn().then(
      // 重新启动至 activity 页面
      () => wx.reLaunch({
        url: `../activity/activity?activity_id=${activityId}`
      })
    )
  },

  /* ================================================================================ */

  /**
   * 获取当前用户相关的 activities
   */

  getMyActivities: function (pageNo) {
    // 获取 activities
    qcloud.request({
      url: `${configs.weapp}/activities?page_no=${pageNo}`,
      login: true,
      success: res => {
        const arr = res.data.data // activities 原始数据
        if (arr.length > 0) {
          let activities = [], map = {}
          for (let i = 0; i < arr.length; i++) {
            let item = arr[i]
            // 为 item 动态增加一个 disciplineName 属性/值，用于页面显示
            item['disciplineName'] = disciplines.find(e => {
              return e.id === item.disciplineId
            }).name
            // 解析 item 的 studentInfo, tutorInfo
            const studentInfo = JSON.parse(item.studentInfo)
            item.studentInfo = studentInfo
            // 根据 createDate 重新组织数据
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
          // 追加 activities
          // const tmp = this.data.activities.concat(activities)
          // this.setData({
          //   activities: tmp
          // })
          // 初始化 activities
          this.setData({
            activities: activities
          })
        }
        this.setData({
          loading: false
        })
      },
      fail: err => {
        console.log(err)
        this.setData({
          loading: false
        })
      }
    })
  }

})