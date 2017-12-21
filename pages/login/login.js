// pages/login/login.js
  const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    havePassword: '', //密码登录还是手机号码登录
    name:'',//手机号或账号
    password:'',//登录密码或短信验证码
    codeTime: 0,//短信验证码倒计时
    appid:'wxcbb8ea1dc4067814',
    register: false, //注册显示控制
    passwords: '',//注册密码
    passwordsAlign: '',//注册再次密码
    bindWechat: false //微信绑定登录
  },

  // 用户名
  userName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 密码
  userPassword:function(e){
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  login:function(e){
    let that = this;
    let data = new Object;
    data.name = this.data.name;
    if (that.data.bindWechat){
      data.type = 'wechat';
      data.unionid = wx.getStorageSync('unionid');
      data.appid = that.data.appid;
    }

    if (this.data.havePassword){
      data.pwd = this.data.password;
      data.wechat = 'wechat';
      app.ajax('POST', 'm/Login/DHW', data, res => {
        wx.setStorageSync('USERID', res.data.result.id);//将用户ID存入缓存
        wx.navigateBack({
          delta: 1
        })
      },res => {
        wx.showToast({
          icon: 'loading',
          title: res.data.msg,
        });
      })
    }else{
      data.verify = this.data.password;
      app.ajax('POST','m/login/SMS', data, res => {
        wx.setStorageSync('USERID', res.data.result.id);//将用户ID存入缓存
        wx.navigateBack({
          delta: 1
        })
      }, res => {
        wx.showToast({
          icon: 'loading',
          title: res.data.msg,
        });
      })
    }
  },

  // 微信登录
  wechatLogin:function(e){
    const appid = 'wx2d5653d6c2e6b5a6';
    const secret = 'df5fa381eb187eaf1a83500aa2a38ea5';
    let unionId = wx.getStorageSync('unionId') || false;
    let that = this;
    if (unionId){
      // 5 查询是否绑定账号
      app.ajax('POST', 'm/Login/WeChatThirdPartyBind', { 'type': 'wechat', unionid: unionId, appid: appid },
        u => {
          // 已绑定
          wx.setStorageSync('USERID', u.data.result.id);
          wx.navigateBack({
            delta: 1
          })
        }, u => {
          // 未绑定
          wx.redirectTo({
            url: '../loginBefore/loginBefore',
          })
        })
    }else{
       // 1 登录
      wx.login({
        success: res => {
          //2 发送 res.code 到后台换取 openId, sessionKey, unionId
          if(res.code){
            wx.request({
              url: 'https://api.weixin.qq.com/sns/jscode2session',
              type:'POST',
              data:{
                appid: appid,
                secret: secret,
                js_code: res.code,
                grant_type: 'authorization_code'
              },
              success: e => {
                wx.setStorageSync('unionid', e.data.unionid);
                that.setData({
                  unionid: e.data.unionid
                })
                //3 获取微信用户基本信息
                wx.getUserInfo({
                  success: event => {
                    let userInfo = JSON.stringify(event.userInfo);
                    let userData = { 
                      appid: appid, 
                      openid: e.data.openid, 
                      unionid: e.data.unionid, 
                      userinfo: userInfo 
                    }
                    //4 保存微信用户基本信息
                    app.ajax('POST', 'm/login/WechatUserInfoAdd', userData, user => {
                      
                      // 5 查询是否绑定账号
                      app.ajax('POST', 'm/Login/WeChatThirdPartyBind', { 'type': 'wechat', unionid: userData.unionid, appid: appid},
                      u => {
                        // 已绑定
                        wx.setStorageSync('USERID', u.data.result.id);
                        wx.navigateBack({
                          delta: 1
                        })
                      }, u => {
                        // 未绑定
                        wx.redirectTo({
                          url: '../loginBefore/loginBefore',
                        })
                      })
                    })
                  }
                })
              },
              fail: function(e){
                wx.showToast({
                  title: '网络错误',
                })
              }
            })
          }
        }
      })
    }
   

  },

  // 清除用户名
  clearLogin:function(e){
    this.setData({
      name: '',
      password: ''   
    })
  },

  // 获取短信验证码
  getCode:function(e){
    let that = this;
    let phone = this.data.name;
    if(app.globalData.phoneReg.test(phone)){
      let url = 'm/login/PhoneSMS';
      if (that.data.register){
        url = 'm/reg/PhoneSMS'
      }
      app.ajax('POST', url, { phone: phone},res => {
        // console.log(res)
        wx.showToast({
          title: res.data.result,
        })
        let codeTime = 60;
        let interval = setInterval(() => {
              codeTime--;
              that.setData({
                codeTime: codeTime
              });
              if (codeTime === 0){
                clearInterval(interval);
              }
            },1000)
      })
    }else{
      wx.showToast({
        title: '手机号码有误',
      })
    }
  },

  // 切换登录形式
  switchLogin:function(e){
    let that = this;
    this.setData({
      havePassword: !that.data.havePassword, 
      name: '',
      password: ''
    })
  },

  // 注册并登录
  register:function(e){
    let data = new Object;
    let that = this;
    data.phone = that.data.name;
    data.pwd = that.data.passwords;
    data.verify = that.data.password;
    data.loginType = 'wechat';
    data.unionid = wx.getStorageSync('unionid');
    data.appid = that.data.appid;
    app.ajax('POST', 'm/reg/SMS', data, res => {
      wx.setStorageSync('USERID', res.data.result.id);//将用户ID存入缓存
      wx.navigateBack({
        delta: 1
      })
    }, res => {
      wx.showToast({
        icon: 'loading',
        title: res.data.msg,
      });
    })
  },

  // 注册密码输入
  passwords:function(e){
    this.setData({
      passwords: e.detail.value
    })
  },

  // 注册密码再次输入
  passwordsAlign: function (e) {
    this.setData({
      passwordsAlign: e.detail.value
    })
  },
//  判断两次密码的一致性
  passwordsAlignBlur:function(e){
    let passwordsAlign = e.detail.value;
    if (passwordsAlign !== this.data.passwords){
      wx.showToast({
        title: '两次密码不一致',
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let havePassword = options.havePassword || '';
    if (havePassword == 'false'){
      // 注册关联
      this.setData({
        havePassword: false,
        register: true,
        bindWechat: true
      })
    } else if (havePassword == 'true'){
      // 登录关联
      this.setData({
        havePassword: true,
        bindWechat: true
      })
    }else{
      // 普通登录
      this.setData({
        havePassword: true
      })
    }
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