//app.js

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

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
  },
  globalData: {
    userInfo: null,
    ddid: 48,//内网 48  外网 703
    TESTURL: 'http://192.168.2.17:8098/shopjimigaga/',
    FORMAL: 'http://www.mengyunjie.com/shopjimigaga/',
    URL: 'http://192.168.2.17:8098/shopjimigaga/',
    SOURCEURL: 'http://112.109.215.18/wechatWX/',
    phoneReg: /^1[3|4|5|7|8]\d{9}$/
  },
  
  // ajax请求函数封装
  ajax: function (method, url, data, success, error){
    error = error || function (res) { console.log(res) };
    success = success || function (res) { console.log(res) };
    if (typeof(data) === 'function'){
      error = success;
      success = data;
      data = '';
    }
    wx.request({
      url: this.globalData.TESTURL + url,
      method: method,
      dataType: 'json',
      data: data,
      success: function(res){
        if (res.data.success){
          success(res);
        }else{
          error(res);
        }
      },
      fail: function(res){
        error(res);
      },
      complete: function(res){
        console.log(res);
        console.log(data)
      }
    })
  },

  loginBefore:function(e){
    try {
      var value = wx.getStorageSync('USERID')
      console.log(value)
      if (!value) {
        // Do something with return value
        wx.navigateTo({
          url: '../login/login'
        })
      }
    } catch (e) {
      // Do something when catch error
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },

  // 微信支付
  payment: function(id){
    this.ajax('POST','m/Order/WxApplet', {'number': id}, res => {
      wx.requestPayment({
        timeStamp: res.data.result.timeStamp,
        nonceStr: res.data.result.nonceStr,
        package: res.data.result.package,
        signType: res.data.result.signType,
        paySign: res.data.result.paySign,
        success: ress => {
          wx.showToast({
            title: '支付成功',
            success: resss => {
              wx.redirectTo({
                url: '../orderList/orderList?state=1',
              })
            }
          })
        },
        fail: ress => {

        }
      })
    }, res => {
      wx.showToast({
        icon: 'loading',
        title: '网络繁忙请重试',
      })
    })
  }
})