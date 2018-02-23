Page({
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
          activityId: '123456'
        }, {
          discipline: {
            id: 'maths',
            name: '数学'
          },
          activityId: '123456'
        }, {
          discipline: {
            id: 'english',
            name: '英语'
          },
          activityId: '123456'
        }]
      }, {
        date: '2018年1月2日 星期二',
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
          activityId: '123456'
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
          activityId: '123456'
        }]
      }]
    }
  }
})