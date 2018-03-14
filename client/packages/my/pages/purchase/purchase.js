Page({

  /**
   * 页面的初始数据
   */

  data: {
    servicePlans: [
      { spid: 1, hearts: 1, price: 19.9 },
      { spid: 2, hearts: 10, price: 199 }
    ]
  },

  /* ================================================================================ */

  buyButtonTap: function () {
    console.log(`点击 buyButton`)
    wx.requestPayment({
      'timeStamp': '',
      'nonceStr': '',
      'package': '',
      'signType': 'MD5',
      'paySign': '',
      'success': res => {
        console.log('支付成功')
      },
      'fail': res => {
        console.log('支付失败')
      }
    })
  }

})