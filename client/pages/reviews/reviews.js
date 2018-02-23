Page({

  /**
   * 页面的初始数据
   */

  data: {
    notebook: {
      userId: '123456',
      notes: [{
        date: '2018年1月3日 星期三',
        records: [{
          discipline: {
            id: 'chinese',
            name: '语文'
          },
          activityId: '123451'
        }, {
          discipline: {
            id: 'maths',
            name: '数学'
          },
          activityId: '123452'
        }, {
          discipline: {
            id: 'english',
            name: '英语'
          },
          activityId: '123453'
        }]
      }, {
        date: '2018年1月2日 星期二',
        records: [{
          discipline: {
            id: 'chinese',
            name: '语文'
          },
          activityId: '123454'
        }, {
          discipline: {
            id: 'maths',
            name: '数学'
          },
          activityId: '123455'
        }]
      }, {
        date: '2018年1月1日 星期一',
        records: [{
          discipline: {
            id: 'chinese',
            name: '语文'
          },
          activityId: '123456'
        }, {
          discipline: {
            id: 'maths',
            name: '数学'
          },
          activityId: '123457'
        }]
      }]
    }
  },


  /**
   * 绑定事件：点击 Activity Cell
   */

  activityCellTap: function (e) {
    const activityId = e.currentTarget.dataset.activityId
    console.log(`activity cell tap, activityId: ${activityId}`)
    loginService.ensureLoggedIn().then(
      () => {
        wx.navigateTo({
          url: `../activity/activity?activity_id=${activityId}`
        })
      }
    )
  }

})