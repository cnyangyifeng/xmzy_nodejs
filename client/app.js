var qcloud = require('./vendor/wafer2-client-sdk/index')
var configs = require('./config')

App({

  globalData: {
  },

  onLaunch: function () {
    qcloud.setLoginUrl(`${configs.weapp}/login`)
  }

})