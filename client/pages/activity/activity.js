const configs = require('../../config')
const loginService = require('../../services/loginService')
const msgs = require('../../msg')
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const UserInfo = require('../../services/userInfo')

const canvasContext = wx.createCanvasContext('imageCanvas')
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */

  data: {
    studentInfo: null, // 当前 Student 信息
    tutorInfo: null, // 当前 Tutor 信息

    activity: null, // 当前 Activity

    activityId: '', // 当前 Activity 的 Id
    assignmentSerialNumber: 0, // 当前 Assignment 的 Serial Number
    assignmentsCount: 0, // 当前 Activity 相关的全部 Assignment 数量
    imageUrl: '', // 当前 Assignment 的 Image Url
    imageCanvasWidth: 0, // Image Canvas 的宽度
    imageCanvasHeight: 0, // Image Canvas 的高度
    speakButtonText: '按住 说话', // 说话按钮的文本
    imageUrlToUpload: '', // 即将上传的 Assignment 的 Image Url
    audioUrlToUpload: '', // 即将上传的 Xmessage 的 Audio Url
    recorderTimer: 0,
    xmessages: [] // 语音列表
  },

  /**
   * 监听页面加载
   */

  onLoad: function (options) {
    // 从 URL 中读取 activity_id 参数，更新页面数据 activityId
    // 从本地缓存中读取 userInfo，更新页面数据 userInfo
    this.setData({
      activityId: options.activity_id,
      studentInfo: UserInfo.get()
    })
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: `12.31 语文作业`
    })
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
    // 获取当前 Activity 相关的全部 Assignment 数量
    this.getAssignmentsCountByActivityId()
      // 显示当前 Assignment 的 Image Data
      .then(this.showImageDataByActivityIdAndSerialNumber)
      // 显示当前 Activity 相关的全部 Xmessages
      .then(this.showXmessagesByActivityId)
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
    return {
      title: `${this.data.studentInfo.nickName} 12.31 语文作业`,
      path: `pages/activity/activity?activity_id=${this.data.activityId}`,
      success: res => {
        console.log(`on share app message success`)
      },
      fail: err => {
        console.log(`on share app message cancel`)
      }
    }
  },

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
   * 绑定事件：点击 pageUpButton
   */

  pageUpButtonTap: function () {
    // 更新当前 Assignment 的 Serial Number
    let serialNumber = 0
    if (this.data.assignmentSerialNumber < this.data.assignmentsCount - 1) {
      serialNumber = this.data.assignmentSerialNumber + 1
    } else {
      serialNumber = 0
    }
    console.log(`serial number: ${serialNumber}`)
    // 更新页面数据 assignmentSerialNumber
    this.setData({
      assignmentSerialNumber: serialNumber
    })
    // 显示当前 Assignment 的 Image Data
    this.showImageDataByActivityIdAndSerialNumber()
  },

  /**
   * 绑定事件：点击 pageDownButton
   */

  pageDownButtonTap: function () {
    // 更新当前 Assignment 的 Serial Number
    let serialNumber = 0
    if (this.data.assignmentSerialNumber > 0) {
      serialNumber = this.data.assignmentSerialNumber - 1
    } else {
      serialNumber = this.data.assignmentsCount - 1
    }
    console.log(`serial number: ${serialNumber}`)
    // 更新页面数据 assignmentSerialNumber
    this.setData({
      assignmentSerialNumber: serialNumber
    })
    // 显示当前 Assignment 的 Image Data
    this.showImageDataByActivityIdAndSerialNumber()
  },

  /**
   * 绑定事件：点击 cameraButton
   */

  cameraButtonTap: function () {
    console.log(`camera button tap`)
    // 跳转至 camera 页面
    wx.navigateTo({
      url: `../camera/camera?activity_id=${this.data.activityId}&assignment_serial_number=${this.data.assignmentsCount}`,
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
        // 更新页面数据 imageUrlToUpload
        this.setData({
          imageUrlToUpload: res.tempFilePaths[0]
        })
        loginService.ensureLoggedIn()
          // 提交 Assignment
          .then(this.postAssignment)
          // 提交 Assignment 的回调函数
          .then(this.postAssignmentSuccess, this.postAssignmentFail)
          .then(() => {
            // 重新启动至 Activity 页面
            wx.reLaunch({
              url: `../activity/activity?activity_id=${this.data.activityId}`
            })
          })
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
      recorderTimer: Date.now()
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
      console.log(`recording duration: ${stopTime - this.data.recorderTimer}`)
      if (stopTime - this.data.recorderTimer > 1000) {
        // 更新页面数据 audioUrlToUpload
        this.setData({
          audioUrlToUpload: res.tempFilePath
        })
        // 提交 Xmessage
        loginService.ensureLoggedIn()
          .then(this.postXmessage)
          .then(this.postXmessageSuccess, this.postXmessageFail)
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
   * 获取当前 Activity 相关的全部 Assignments 数量
   */

  getAssignmentsCountByActivityId: function () {
    console.log(`get assignments count by activity id`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_title,
        mask: true
      })
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activityId}/assignments_count`,
        login: true,
        // 请求成功
        success: res => {
          // 更新页面数据 assignmentsCount
          this.setData({
            assignmentsCount: res.data.data
          })
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        // 请求失败
        fail: err => {
          console.log(`获取作业数量失败: ${JSON.stringify(err)}`)
          // 重置页面数据 assignmentsCount 为 0
          this.setData({
            assignmentsCount: 0
          })
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 显示当前 Assignment 的 Image Data
   */

  showImageDataByActivityIdAndSerialNumber: function () {
    console.log(`show image data by activity id and serial number`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_title,
        mask: true
      })
      // 获取 Image Data
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activityId}/assignments/${this.data.assignmentSerialNumber}`,
        login: true,
        // 请求成功
        success: res => {
          // 更新页面数据 imageUrl
          const imageData = JSON.parse(res.data.data)
          this.setData({
            imageUrl: imageData.imgUrl
          })
          // 绘制图片
          wx.getImageInfo({
            src: this.data.imageUrl,
            success: res => {
              const imageScaleWidth = this.data.imageCanvasHeight * res.width / res.height
              const x = (this.data.imageCanvasWidth - imageScaleWidth) / 2
              canvasContext.drawImage(res.path, x, 0, imageScaleWidth, this.data.imageCanvasHeight)
              canvasContext.draw()
            }
          })
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        // 请求失败
        fail: err => {
          console.log(`获取作业失败: ${JSON.stringify(err)}`)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 显示当前 Activity 相关的全部 Xmessages
   */

  showXmessagesByActivityId: function () {
    console.log(`show xmessage by activity id`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.loading_title,
        mask: true
      })
      // 获取 Xmessages
      qcloud.request({
        url: `${configs.weapp}/activities/${this.data.activityId}/xmessages`,
        login: true,
        // 请求成功
        success: res => {
          console.log(JSON.stringify(res.data.data))
          // 更新页面数据 xmessages
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
          console.log(`获取消息失败: ${JSON.stringify(err)}`)
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 提交 Assignment: 上传文件至 COS 并创建一条 Assignment 数据
   */

  postAssignment: function () {
    console.log(`post assignment`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.upload_processing_title,
        mask: true
      })
      wx.uploadFile({
        url: `${configs.weapp}/activities/${this.data.activityId}/assignments/${this.data.assignmentsCount}`,
        filePath: this.data.imageUrlToUpload,
        name: 'file',
        header: qcloud.authHeader(), // 验证用户是否处于登录状态
        success: res => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        fail: err => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 请求失败，则显示 “上传失败” 弹框
          // wx.showModal({
          //   title: msgs.upload_fail_title,
          //   content: msgs.contact_us_to_report_bugs,
          //   showCancel: false
          // })
          wx.showToast({
            title: msgs.upload_fail_title,
            image: '/assets/images/fail.png'
          })
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 提交 Assignment 成功的回调函数
   */

  postAssignmentSuccess: function () {
    console.log(`post assignment success`)
  },

  /**
   * 提交 Assignment 失败的回调函数
   */

  postAssignmentFail: function () {
    console.log(`post assignment fail`)
  },

  /**
   * 提交 Xmessage: 上传文件至 COS 并创建一条 Xmessage 数据
   */

  postXmessage: function (tempImagePath) {
    console.log(`post xmessage`)
    return new Promise((resolve, reject) => {
      // 显示 loading 提示框
      wx.showLoading({
        title: msgs.send_xmessage_processing_title,
        mask: true
      })
      // 上传文件至 COS 并创建一条 Xmessage 数据
      wx.uploadFile({
        url: `${configs.weapp}/activities/${this.data.activityId}/xmessages`,
        filePath: this.data.audioUrlToUpload,
        name: 'file',
        header: qcloud.authHeader(), // 验证用户是否处于登录状态
        success: res => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 操作成功
          resolve()
        },
        fail: err => {
          // 隐藏 loading 提示框
          wx.hideLoading()
          // 请求失败，则显示 “发送消息失败” 弹框
          wx.showModal({
            title: msgs.msgs.send_xmessage_fail_title,
            content: msgs.contact_us_to_report_bugs,
            showCancel: false
          })
          // 操作失败
          reject()
        }
      })
    })
  },

  /**
   * 提交 Xmessage 成功的回调函数
   */

  postXmessageSuccess: function () {
    console.log(`post xmessage success`)
    // 显示当前 Activity 相关的全部 Xmessages
    this.showXmessagesByActivityId()
  },

  /**
   * 提交 Xmessage 失败的回调函数
   */

  postXmessageFail: function () {
    console.log(`post xmessage fail`)
  }

})
