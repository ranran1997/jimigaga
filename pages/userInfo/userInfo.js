// pages/userInfo/userInfo.js
const app = getApp();
const ddid = app.globalData.ddid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      imgSrc: '../images/12.jpg',
      name: '张三'
    },
    orderState: [
      {
        icon: 'font-daifukuan1',
        'number': 0,
        stateStr: '待付款',
        state: 0
      },
      {
        icon: 'font-baoguoxiangzi',
        'number': 0,
        stateStr: '待发货',
        state: 1
      },
      {
        icon: 'font-che2',
        'number': 0,
        stateStr: '待收货',
        state: 2
      },
      {
        icon: 'font-loupanziliao',
        stateStr: '全部订单',
        state: ''
      },
    ]
  },

  // 去订单列表页
  orderList:function(e){
    let state = e.currentTarget.dataset.state;//订单状态标识
    wx.navigateTo({
      url: '../orderList/orderList?state=' + state,
    })
  },

  // 去收藏页
  collection:function(e){
    wx.navigateTo({
      url: '../collection/collection',
    })
  },

  // 去地址列表页
  addressList:function(e){
    wx.navigateTo({
      url: '../addressList/addressList?edit=true',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.setData({
                userInfo: res.userInfo
              })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    this.getOrder();
  },

  // 获取订单数量
  getOrder: function(e){
    // state 0 待付款  1 待发货   2 待收货  3 已完成

    // 待付款
    app.ajax('POST', 'erp/VipBuyer/BuyersOrderList', { state: 0, ddid: ddid, pageIndex: 1, pageSize: 10 }, res => {
      this.data.orderState[0].number = res.data.result.total;
      this.setData({
        orderState: this.data.orderState
      })
    })

    // 待发货
    app.ajax('POST', 'erp/VipBuyer/BuyersOrderList', { state: 1, ddid: ddid, pageIndex: 1, pageSize: 10 }, res => {
      this.data.orderState[1].number = res.data.result.total;
      this.setData({
        orderState: this.data.orderState
      })
    })

    // 待收货
    app.ajax('POST', 'erp/VipBuyer/BuyersOrderList', { state: 2, ddid: ddid, pageIndex: 1, pageSize: 10 }, res => {
      this.data.orderState[2].number = res.data.result.total;
      this.setData({
        orderState: this.data.orderState
      })
    })
  },

  // 退出登录
  logup:function(e){
    app.ajax('POST','m/login/IOSLogout',res => {      
      wx.showModal({
        title: '提示',
        content: '确定退出',
        success: e => {
          if(e.confirm){
            wx.removeStorageSync('USERID');
              wx.switchTab({
                url: '../index/index',
              });
            }
          }
      })
    }, res => {
      wx.showToast({
        icon: 'loading',
        title: '网络繁忙请重试',
      });
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    app.loginBefore();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getOrder();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})