const configs = require('../../config')
const disciplines = require('../../services/disciplines')
const loginService = require('../../services/loginService')
const moment = require('../../utils/moment-with-locales.min.js')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')

const canvasContext = wx.createCanvasContext('imageCanvas')
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */

  data: {

    /*
     * Activity
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
     */

    activity: null, // 当前 Activity
    activityId: '', // 当前 Activity 的 Id
    studentInfo: null, // 当前 StudentInfo
    tutorInfo: null, // 当前 TutorInfo
    assignment: null, // 当前 Assignment

    /* 当前 Activity - Assignment 相关的 Xmessages */

    xmessages: [],

    recorderStartTime: 0, // 开始录音的时间，用于计算录音时长

    /* Page UI 数据 */

    imageCanvasWidth: 0, // Image Canvas 的宽度
    imageCanvasHeight: 0, // Image Canvas 的高度
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
    // Moment 本地化
    moment.locale('zh-cn')
  },

  /**
   * 监听页面初次渲染完成
   */

  onReady: function () {
    // 设置 Image Canvas 的尺寸
    wx.createSelectorQuery().select('#image-canvas').boundingClientRect(rect => {
      this.setData({
        imageCanvasWidth: rect.width,
        imageCanvasHeight: rect.height
      })
    }).exec()
    // 获取当前 Activity - Assignment
    this.getActivityByActivityId()
      // 显示当前 Activity - Assignment 相关的全部 Xmessages
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
    let title;
    if (this.data.activity) {
      const studentNickName = this.data.studentInfo.nickName
      const createDate = moment(this.data.activity.createTime).format('MMMDo dddd')
      const disciplineName = disciplines.find(e => {
        return e.id === this.data.activity.disciplineId
      }).name
      title = `${studentNickName} ${createDate} ${disciplineName}`
    } else {
      title = `熊猫作业`
    }
    // 设置转发信息
    return {
      title: title,
      path: `pages/activity/activity?activity_id=${this.data.activityId}`,
      success: res => {
        console.log(`on share app message success`)
      },
      fail: err => {
        console.log(`on share app message cancel`)
      }
    }
  },

  /* ================================================================================ */

  /**
   * 绑定事件：点击 xmessageView
   */

  xmessageViewTap: function (e) {
    const vid = e.currentTarget.dataset.vid
    console.log(`message view tap: ${this.data.xmessages[vid].filePath}`)
    innerAudioContext.src = this.data.xmessages[vid].filePath
    innerAudioContext.onPlay(() => {
      console.log('开始播放语音')
    })
    innerAudioContext.onError((res) => {
      console.log('播放语音异常')
      console.log('errMsg: ' + res.errMsg)
      console.log('errCode: ' + res.errCode)
    })
    innerAudioContext.play()
  },

  imageCanvasTouchStart: function () {
    console.log(`image canvas touch start`)
  },

  imageCanvasTouchMove: function () {
    console.log(`image canvas touch move`)
  },

  imageCanvasTouchEnd: function () {
    console.log(`image canvas touch end`)
  },

  /**
   * 绑定事件：点击 settingButton
   */

  settingButtonTap: function () {
    console.log(`setting button tap`)
    wx.openSetting()
  },

  /**
   * 绑定事件：点击 closeButton
   */

  closeButtonTap: function () {
    wx.showModal({
      title: msgs.confirm_exit_classroom_title,
      content: msgs.confirm_exit_classroom_content,
      success: res => {
        if (res.confirm) {
          // 重新启动至 Home 页面
          wx.reLaunch({
            url: `../home/home`
          })
        } else if (res.cancel) {
          console.log('cancel exiting classroom')
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
    console.log('gallery button tap')
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
      console.log('recorder manager on start')
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
      console.log(`recorder manager on stop`)
      const stopTime = Date.now()
      console.log(`recording duration: ${stopTime - this.data.recorderStartTime}`)
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
      // wx.saveFile({
      //   tempFilePath: tempFilePath,
      //   success: res => {
      //     console.log('saved file path: ' + res.savedFilePath)
      //   }
      // })
      // wx.getSavedFileList({
      //   success: res => {
      //     let xmessages = []
      //     for (let i = 0; i < res.fileList.length; i++) {
      //       const createTime = new Date(res.fileList[i].createTime)
      //       const voice = { vid: i, filePath: res.fileList[i].filePath, createTime: createTime }
      //       xmessages = xmessages.concat(voice)
      //     }
      //     this.setData({
      //       xmessages: xmessages
      //     })
      //   }
      // })
    })
    recorderManager.stop()
  },

  /* ================================================================================ */

  /**
   * 获取当前 Activity - Assignment
   */

  getActivityByActivityId: function () {
    console.log(`get activity by activity id`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_activity_title,
        mask: true
      })
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activityId}`,
        /* login: true, */
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
          const title = `${createDate} ${disciplineName}`
          wx.setNavigationBarTitle({
            title: title
          })
          // 绘制 Assignment
          if (this.data.assignment) {
            const imageData = JSON.parse(this.data.assignment.imageData)
            wx.getImageInfo({
              src: imageData.imgUrl,
              success: res => {
                const imageScaleWidth = this.data.imageCanvasHeight * res.width / res.height
                const x = (this.data.imageCanvasWidth - imageScaleWidth) / 2
                canvasContext.drawImage(res.path, x, 0, imageScaleWidth, this.data.imageCanvasHeight)
                canvasContext.draw()
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
          console.log(`get activity fail: ${JSON.stringify(err)}`)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 显示当前 Activity - Assignment 相关的全部 Xmessages
   */

  getXmessagesByActivityIdAndAssignmentId: function () {
    return new Promise((resolve, reject) => {
      console.log(`get xmessages by activity id and assignment id`)
      // 如果未指定当前 Assignment，则直接返回 
      if (!this.data.assignment) {
        return
      }
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_xmessages_title,
        mask: true
      })
      // 获取 Xmessages
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activity.activityId}/assignments/${this.data.assignment.assignmentId}/xmessages`,
        /* login: true, */
        // 请求成功
        success: res => {
          console.log(JSON.stringify(res.data.data))
          // 更新页面数据 xmessages
          res.data.data.forEach(item => {
            item.senderInfo = JSON.parse(item.senderInfo)
          })
          this.setData({
            xmessages: res.data.data
          })
          console.log(this.data.xmessages)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        // 请求失败
        fail: err => {
          console.log(`获取 Xmessages 失败: ${JSON.stringify(err)}`)
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
   * 提交 Assignment
   */

  postAssignment: function (filePath) {
    console.log(`post assignment`)
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
        // 重新启动至 Activity 页面
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
   * 提交 Xmessage
   */

  postXmessage: function (filePath) {
    console.log(`post xmessage`)
    // 如果未指定当前 Assignment，则直接返回 
    if (!this.data.assignment) {
      return
    }
    // 显示 loading 提示框
    wx.showLoading({
      title: msgs.send_xmessage_processing_title,
      mask: true
    })
    // 上传文件至 COS 并创建一条 Xmessage 数据
    wx.uploadFile({
      url: `${configs.weapp}/activities/${this.data.activity.activityId}/assignments/${this.data.assignment.assignmentId}/xmessages`,
      filePath: filePath,
      name: 'file',
      header: qcloud.authHeader(), // 验证用户是否处于登录状态
      success: res => {
        // 隐藏 loading 提示框
        wx.hideLoading()
        // 显示当前 Activity 相关的全部 Xmessages
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
