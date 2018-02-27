const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const moment = require('../../utils/moment-with-locales.min.js')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')

const backdropContext = wx.createCanvasContext('backdrop')
const audioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */

  data: {

    /*
     *
     * activity
     *  - activityId
     *  - disciplineId
     *  - studentId
     *  - studentInfo (key: openId)
     *  - tutorId
     *  - tutorInfo (key: openId)
     *  - status
     *  - currentAssignmentId
     *  - currentAssignment (key: currentAssignmentId)
     *    - assignmentId
     *    - activityId
     *    - senderId
     *    - senderInfo (key: openId)
     *    - xmStatus
     *    - imageData
     *    - createTime
     *    - lastVisitTime
     *  - createTime
     *  - lastVisitTime
     * 
     */

    activity: null, // 当前 activity
    activityId: '', // 当前 activity 的 id
    studentInfo: null, // 当前 studentInfo
    tutorInfo: null, // 当前 tutorInfo
    assignment: null, // 当前 assignment

    /* 当前 activity, assignment 相关的 xmessages */

    xmessages: [],

    recorderStartTime: 0, // 开始录音的时间，用于计算录音时长

    /* Page UI 数据 */

    backdropWidth: 0, // backdrop 的宽度
    backdropHeight: 0, // backdrop 的高度
    speakButtonText: '按住 说话', // 说话按钮的文本

  },

  /* ================================================================================ */

  /**
   * 监听页面加载
   */

  onLoad: function (options) {
    // 从 URL 中读取 activity_id 参数，更新页面数据 activityId
    this.setData({
      activityId: options.activity_id
    })
    // moment 本地化
    moment.locale('zh-cn')
  },

  /**
   * 监听页面初次渲染完成
   */

  onReady: function () {
    // 设置 backdrop 的尺寸
    wx.createSelectorQuery().select('#backdrop').boundingClientRect(rect => {
      this.setData({
        backdropWidth: rect.width,
        backdropHeight: rect.height
      })
    }).exec()
    // 获取当前 activity, assignment
    this.getActivityByActivityId()
      // 显示当前 activity, assignment 相关的全部 xmessages
      .then(this.getXmessagesByActivityIdAndAssignmentId)
      // 获取微信授权: scope.record
      .then(this.authRecordScope)
  },

  /**
   * 监听页面显示
   */

  onShow: function () {

  },

  /**
   * 监听页面隐藏
   */

  onHide: function () {

  },

  /**
   * 用户点击右上角转发
   */

  onShareAppMessage: function () {
    // 设置转发信息的标题
    let title
    if (this.data.activity) {
      const createDate = moment(this.data.activity.createTime).format('MMMDo dddd')
      const disciplineName = disciplines.find(e => {
        return e.id === this.data.activity.disciplineId
      }).name
      title = `${createDate} ${disciplineName}作业`
    } else {
      title = `熊猫作业`
    }
    // 设置转发信息
    return {
      title: title,
      path: `pages/activity/activity?activity_id=${this.data.activityId}`,
      success: res => {
        console.log(`转发成功`)
      },
      fail: err => {
        console.log(`取消转发`)
      }
    }
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 xmessage
   */

  xmessageTap: function (e) {
    console.log(`点击 xmessage`)
    const vid = e.currentTarget.dataset.vid
    audioContext.src = this.data.xmessages[vid].filePath
    audioContext.onPlay(() => {
      console.log(`开始播放 xmessage`)
    })
    audioContext.onError((res) => {
      console.log(`播放 xmessage 出现错误`)
      console.log(` - errMsg: ` + res.errMsg)
      console.log(` - errCode: ` + res.errCode)
    })
    audioContext.play()
  },

  backdropTouchStart: function () {
    console.log(`开始触摸 backdrop`)
  },

  backdropTouchMove: function () {
    console.log(`移动触摸 backdrop`)
  },

  backdropTouchEnd: function () {
    console.log(`结束触摸 backdrop`)
  },

  /**
   * 绑定事件：点击 settingButton
   */

  settingButtonTap: function () {
    console.log(`点击 settingButton`)
    wx.openSetting()
  },

  /**
   * 绑定事件：点击 closeButton
   */

  closeButtonTap: function () {
    console.log(`点击 closeButton`)
    wx.showModal({
      title: msgs.confirm_exit_classroom_title,
      content: msgs.confirm_exit_classroom_content,
      success: res => {
        if (res.confirm) {
          console.log(`离开教室，重新启动至 home 页面`)
          // 重新启动至 home 页面
          wx.reLaunch({
            url: `../home/home`
          })
        } else if (res.cancel) {
          console.log(`取消离开教室`)
        }
      }
    })
  },

  /**
   * 绑定事件：点击 chooseImageButton
   */

  chooseImageButtonTap: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 提交 Assignment
        loginService.ensureLoggedIn().then(
          () => this.postAssignment(res.tempFilePaths[0])
        )
      }
    })
  },

  /**
   * 绑定事件：点击 galleryButton
   */

  galleryButtonTap: function () {
    console.log(`点击 galleryButton`)
    wx.previewImage({
      current: 'https://xmzy-1252644202.cos.ap-guangzhou.myqcloud.com/weapp/bg.jpg',
      urls: ['https://xmzy-1252644202.cos.ap-guangzhou.myqcloud.com/weapp/bg.jpg', 'https://xmzy-1252644202.cos.ap-guangzhou.myqcloud.com/weapp/bg.jpg']
    })
  },

  /**
   * 绑定事件：开始点击 speakButton
   */

  speakButtonTouchStart: function () {
    this.setData({
      speakButtonText: '松开 结束',
      recorderStartTime: Date.now()
    })
    recorderManager.onStart(() => {
      console.log('启动 recorderManager')
    })
    const options = {
      duration: 600000, // 10min
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    recorderManager.start(options)
  },

  /**
   * 绑定事件：结束点击 speakButton
   */

  speakButtonTouchEnd: function () {
    this.setData({
      speakButtonText: '按住 说话'
    })
    recorderManager.onStop(res => {
      console.log(`终止 recorderManager`)
      const stopTime = Date.now()
      console.log(`录音时长: ${stopTime - this.data.recorderStartTime}`)
      if (stopTime - this.data.recorderStartTime > 500) {
        // 提交 Xmessage
        loginService.ensureLoggedIn().then(
          () => this.postXmessage(res.tempFilePath)
        )
      } else {
        wx.showModal({
          title: msgs.record_duration_too_short_title,
          content: msgs.record_duration_too_short_content,
          showCancel: false
        })
      }
    })
    recorderManager.stop()
  },

  /* ================================================================================ */

  /**
   * 获取当前 activity, assignment
   */

  getActivityByActivityId: function () {
    console.log(`获取当前 activity, assignment`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_activity_title,
        mask: true
      })
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activityId}`,
        // 请求成功
        success: res => {
          // 更新页面数据 activity, studentInfo, tutorInfo
          this.setData({
            activity: res.data.data,
            studentInfo: JSON.parse(res.data.data.studentInfo),
            tutorInfo: JSON.parse(res.data.data.tutorInfo),
            assignment: JSON.parse(res.data.data.currentAssignment)
          })
          // 设置页面标题
          const createDate = moment(this.data.activity.createTime).format('MMMDo')
          const disciplineName = disciplines.find(e => {
            return e.id === this.data.activity.disciplineId
          }).name
          const title = `${createDate} ${disciplineName}作业`
          wx.setNavigationBarTitle({
            title: title
          })
          // 绘制 assignment
          if (this.data.assignment) {
            const imageData = JSON.parse(this.data.assignment.imageData)
            wx.getImageInfo({
              src: imageData.imgUrl,
              success: res => {
                const imageScaleWidth = this.data.backdropHeight * res.width / res.height
                const x = (this.data.backdropWidth - imageScaleWidth) / 2
                backdropContext.drawImage(res.path, x, 0, imageScaleWidth, this.data.backdropHeight)
                backdropContext.draw()
              }
            })
          }
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        // 请求失败
        fail: err => {
          console.log(err)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 获取当前 activity, assignment 相关的全部 xmessages
   */

  getXmessagesByActivityIdAndAssignmentId: function () {
    return new Promise((resolve, reject) => {
      console.log(`获取当前 activity, assignment 相关的全部 xmessages`)
      // 如果未指定当前 assignment，则直接返回 
      if (!this.data.assignment) {
        return
      }
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_xmessages_title,
        mask: true
      })
      // 获取 xmessages
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activity.activityId}/assignments/${this.data.assignment.assignmentId}/xmessages`,
        // 请求成功
        success: res => {
          // 更新页面数据 xmessages
          res.data.data.forEach(item => {
            item.senderInfo = JSON.parse(item.senderInfo)
          })
          this.setData({
            xmessages: res.data.data
          })
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        // 请求失败
        fail: err => {
          console.log(err)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 获取微信授权: scope.record
   */

  authRecordScope: function () {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
            },
            fail() {
              wx.showModal({
                title: msgs.auth_fail_title,
                content: msgs.auth_record_fail_content,
                showCancel: false,
                success: function (res) {
                  // 点击 “确定” 按钮，则调起 “小程序设置” 页面
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  /**
   * 提交 assignment
   */

  postAssignment: function (filePath) {
    console.log(`提交 assignment`)
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.send_assignment_processing_title,
      mask: true
    })
    wx.uploadFile({
      url: `${configs.weapp}/activities/${this.data.activity.activityId}/assignments`,
      filePath: filePath,
      name: 'file',
      header: qcloud.authHeader(), // 验证用户是否处于登录状态
      success: res => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 重新启动至 activity 页面
        wx.reLaunch({
          url: `../activity/activity?activity_id=${this.data.activity.activityId}`
        })
      },
      fail: err => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 请求失败，则显示失败弹框
        wx.showToast({
          title: msgs.send_assignment_fail_title,
          image: '/assets/images/fail.png',
          mask: true
        })
      }
    })
  },

  /**
   * 提交 xmessage
   */

  postXmessage: function (filePath) {
    console.log(`提交 xmessage`)
    // 如果未指定当前 assignment，则直接返回 
    if (!this.data.assignment) {
      return
    }
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.send_xmessage_processing_title,
      mask: true
    })
    // 上传文件至 cos 并创建一条 xmessage 数据
    wx.uploadFile({
      url: `${configs.weapp}/activities/${this.data.activity.activityId}/assignments/${this.data.assignment.assignmentId}/xmessages`,
      filePath: filePath,
      name: 'file',
      header: qcloud.authHeader(), // 验证用户是否处于登录状态
      success: res => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 显示当前 activity 相关的全部 xmessages
        this.getXmessagesByActivityIdAndAssignmentId()
      },
      fail: err => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 请求失败，则显示失败弹框
        wx.showToast({
          title: msgs.msgs.send_xmessage_fail_title,
          image: '/assets/images/fail.png',
          mask: true
        })
      }
    })
  }

})
