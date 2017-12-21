// pages/productDetail/productDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    swiperImgs: [ //banner 图
      '../images/1.jpg',
      '../images/1.jpg',
      '../images/1.jpg'
    ],
    storeTotal:"455.00",//门店价
    total:"49.80", //现价
    title: "佳沛奇异果 陕西眉县 猕猴桃 12粒装 单果 自营水果",//商品标题
    description: "新鲜水果，酸甜好滋味，人气大明星",//商品描述
    totalSmall: 0,//价格零头小字体
    totalBig: 0,//价格整数大字体
    storeName: "吉米嘎嘎晋江安海店",// 门店名称
    storeAddress: "泉州石狮市南阳路国际轻纺城A区5楼5208号",//门店地址
    detailsImg:[//商品详情
      '../images/details.jpg'
    ],
    shop_count:0,//已经加入购物车的件数
    phone:'',//门店电话
    collection: false,//是否收藏
    cartCount:0, //购物车数量
    mpcount:0 //库存数量
  },

  //加入购物车
  cartCount:function(e){
    let that = this;
    if (this.data.mpcount <= this.data.shop_count){
      wx.showToast({
        icon: 'loading',
        title: '已达到库存数量',
      })
      return;
    }
    app.ajax('POST', 'm/ShopCart/Add', { productid: that.data.id, count: 1, sendmode: 1}, res => {
      let cartCount = that.data.cartCount;
      let shop_count = that.data.shop_count;
      cartCount++;
      shop_count++;
      that.setData({
        cartCount: cartCount,
        shop_count: shop_count
      });
      wx.showToast({
        title: '成功加入购物',
      })
    }, res => {
      wx.showToast({
        icon: 'loading',
        title: '网络繁忙',
      })
    })

    
  },

  // 收藏
  collection: function (e) {

    let that = this;
    let collection = this.data.collection;
    let id = this.data.id;
    if (!collection){
      app.ajax('POST', 'm/collect/add', { productid: id}, res => {
        that.setData({
          collection: !collection
        })
      })
    }else{
      app.ajax('POST', 'm/collect/del', { productid: id }, res => {
        that.setData({
          collection: !collection
        })
      })
    }

  },

  // 去购物车
  goToCart:function(){
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  // 打电话
  callTel:function(e){
    let that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.phone,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const USERID = wx.getStorageSync('USERID') || ''
    let productId = options.productId;
    let that = this;
    // 获取商品详情
    app.ajax('POST', 'm/Product/JsonDetail', { id: productId}, res => {
      let collection = res.data.result.row.IsCollect;
      if (collection == 0){
        collection = false;
      }else{
        collection = true;
      }
      let total = res.data.result.row.price;
      let totalBig = total.toString().split('.')[0] || total;
      let totalSmall = total.toString().split('.')[1] || '00';
      that.setData({
        id: productId,
        swiperImgs: res.data.result.images, //轮播图
        detailsImg: res.data.result.content,
        title: res.data.result.row.name,
        description: res.data.result.row.desc,
        total: res.data.result.row.price,
        storeTotal: res.data.result.row.storePrice,
        storeName: res.data.result.row.compayName,
        storeAddress: res.data.result.row.addr,
        phone: res.data.result.row.phone,
        collection: collection,
        shop_count: res.data.result.row.shop_count,
        mpcount: res.data.result.row.mpcount == '-1' ? 999 : res.data.result.row.mpcount,
        totalBig: totalBig,
        totalSmall: totalSmall
      });

    // 获取购物车总数
      if(USERID){
        app.ajax('POST', 'm/ShopCart/Count', count => {
          that.setData({
            cartCount: count.data.result
          })
        }, count => {

        })
      }

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // let total = this.data.total.toString();
    // console.log(total)
    // this.setData({
    //   totalSmall: total.split('.')[1],
    //   totalBig: total.split('.')[0]
    // })
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