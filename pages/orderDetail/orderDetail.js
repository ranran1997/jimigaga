// pages/orderDetail/orderDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // orderState: "待收货",//订单状态
    // orderNumber: "85254526512",//交易单号
    // orderTime: "2017.02.25  14:25",//下单时间
    // name: "姓名",//姓名
    // mobile: "15855555000",//电话
    // address: "福建省石狮市鸿山镇邱下小学对面创企信息公司1栋7楼",//地址

    // store:"吉米呷呷晋江安海店",
    // productLists: [ //商品列表
    //   {
    //     image: '../images/12.jpg',
    //     name: '爱奇果 陕西眉县 猕猴桃12粒装单果90-110g',
    //     price: "12.00",
    //     count: 6
    //   }
    // ],
    // active: false,// 是否展开所有商品
    // total: "1213", //总金额
    // freight: "10.00", //运费
    // discount: "20.22", //优惠金额
    // amountTotal: "666", //实付金额
  },

  // 展示全部商品
  showAll: function (e) {
    let active = this.data.active;
    this.setData({
      active: !active
    })
  },

  // 取消订单
  cancelOrder: function (e) {
    let numberid = this.data.number;
    wx.showModal({
      title: '取消订单',
      content: '是否确认取消',
      success: res => {
        if (res.confirm) {
          app.ajax('POST', 'm/Order/Close', { 'number': numberid }, res => {
            wx.showToast({
              title:'取消成功'
            })
            wx.navigateBack({
              delta: 1
            });
          }, res => {
            wx.showToast({
              icon: 'loading',
              title: '网络繁忙请重试'
            })
          })
        }
      }
    })
  },

  // 发起微信支付
  payment: function(e){
    app.payment(this.data.number)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let numberid = options.numberid;
    app.ajax('POST', 'erp/VipBuyer/BuyersOrderDetail', { 'number': numberid}, res => {
      let data = res.data.result.data;
      this.setData({
        orderState: data.stateName, //中文状态
        state: data.state, //状态
        orderNumber: data.number,//订单号
        orderTime: data.date,//下单时间
        freight: data.deliveryPrice.toFixed(2),//运费
        discount: '0.00',//优惠金额
        amountTotal: data.totalFee,//实付金额
        total: parseFloat(data.totalFee) + parseFloat(data.deliveryPrice),//总金额
        sendName: data.sendName,//配送方式中文
        sendmode: data.sendmode,//配送方式英文
        address: data.receiveAddress,//收货地址
        name: data.receiveName,//收货人姓名
        mobile: data.receivePhone,//收货人电话
        store: data.compayName,//门店名称
        productLists:data.items,//商品列表
        active: false,// 是否展开所有商品
      })
    }, res => {
      wx.showToast({
        icon:'loading',
        title:'网络繁忙请重试'
      })
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