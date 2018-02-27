Page({

  data: {
    servicePlans: [{
      spid: 1,
      vouchersCount: 1,
      price: 19.9
    }, {
      spid: 2,
      vouchersCount: 10,
      price: 199
    }]
  },

  buyButtonTap: function () {
    console.log('buy button tap')
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