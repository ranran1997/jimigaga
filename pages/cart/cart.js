// pages/cart/cart.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productLists:[ //购物车商品列表
      // {
      //   id:'',//商品id  删除接口用 
      //   productid:'',//商品id  加减接口用 
      //   checked:false,//是否选中
      //   title:"巴西精选牛腩块",//名称
      //   stock:10,//库存
      //   imgSrc:'../images/12.jpg',//图片
      //   total:"2.98",//价钱
      //   totalBig:10,//价钱大字体
      //   totalSmall:98,//价钱小字体
      //   count:1//购物车数量
      // }
    ],
    loseProductLists:[ //失效商品列表
      // {
      //   id:'',
      //   title: "巴西精选牛腩块",
      //   imgSrc: '../images/12.jpg',
      //   total: "2.98",
      //   totalBig: 10,
      //   totalSmall: 98,
      //   count: 1
      // }
    ],
    checkedAll: false, //是否全选
    settlementTotal:"0.00", // 结算价格
    settlementTotalBig:"0",//结算价格大字体
    settlementTotalSmall:"00",//结算价格小字体
    settlementCount: 0 //选中商品数量
  },

  // 去结算-> 下单
  settlement: function(e){

    // 重新刷新列表，获取库存数量，判断是否存在库存不足的商品，防止下单失败
    app.ajax('POST', 'm/shopcart/List', res => {
      let productLists = [];
      let loseProductLists = [];
      res.data.result.data.map(value => {
        value.items.map(val => {
          val.stocknum = val.stocknum == -1 ? 999 : val.stocknum;
          if (val.count > val.stocknum){
            wx.showToast({
              icon: 'loading',
              title: '含库存不足的商品',
            });
            return ;
          }
        })
      })
    })


    let productLists = this.data.productLists;
    let pro = '';
    productLists.map(value => {
      if(value.checked){
        pro += (JSON.stringify(value) + '|');
      }
    })

    wx.navigateTo({
      url: '../placeOrder/placeOrder?pro='+ pro,
    })
  },

  // 计算总价
  calcTotal: function(e){
    let that = this;
    let productLists = that.data.productLists;
    let totalAll = 0;
    let settlementCount = 0;
    productLists.map(value => {
      if(value.checked){
        let total = parseFloat(value.total) * value.count;
        totalAll += total;
        settlementCount += parseFloat(value.count)
      }
    });
    let totalBig = totalAll.toFixed(2).toString().split('.')[0] || totalAll;
    let totalSmall = totalAll.toFixed(2).toString().split('.')[1] || '00';
    that.setData({
      settlementTotal: totalAll,
      settlementCount: settlementCount,
      settlementTotalBig: totalBig,
      settlementTotalSmall: totalSmall
    })
  },

  // 减
  deleteCart: function(e){
    let index = e.target.dataset.index;
    let productLists = this.data.productLists
    let count = --productLists[index].count;
    let that = this;
    if (count == 0){
      // 当购物车为 0 的时候，代表删除
      app.ajax('POST', 'm/ShopCart/Del', { id: productLists[index].id }, res => {
        productLists.splice(index,1)
        that.setData({
          productLists: productLists
        })
        that.calcTotal();
      })
    }else{

      app.ajax('POST', 'm/ShopCart/Update', { productid: productLists[index].productid, count: count, skuid: 0 }, res => {
        that.setData({
          productLists: productLists
        })

        that.calcTotal();
      })

    }
    
  },

  // 加
  addCart: function (e) {
    let index = e.target.dataset.index;
    let productLists = this.data.productLists;
    let count = ++productLists[index].count;
    let stock = productLists[index].stock;
    let that = this;
    if (stock < count){
      wx.showToast({
        icon: 'loading',
        title: '库存不足',
      })
      return;
    }
    app.ajax('POST', 'm/ShopCart/Update', { productid: productLists[index].productid, count: count, skuid: 0}, res => {
      that.setData({
        productLists: productLists
      });
      that.calcTotal();
    })
  },

  // 查看商品详情
  detail: function(e){
    let productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: '../productDetail/productDetail?productId=' + productId,
    })
  },

  // 单个商品选中
  checkedP: function(e){
    let index = e.target.dataset.index;
    let that = this;
    let productLists = that.data.productLists;
    productLists[index].checked = !productLists[index].checked;
    that.setData({
      productLists: productLists
    });
    this.calcTotal();
  },

  // 全选
  checkedAll:function(e){
    let productLists = this.data.productLists;
    let checkedAll = this.data.checkedAll;
    productLists.map(value => {
      value.checked = !checkedAll;
    });
    this.setData({
      productLists: productLists,
      checkedAll: !checkedAll
    });
    this.calcTotal();
  },

  //清空失效商品
  clearLose:function(e){
    app.ajax('POST','m/ShopCart/List_Invalid_Del',res => {});
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userid = wx.getStorageSync('USERID') || false;
    if(!userid){
      wx.navigateTo({
        url: '../login/login',
      })
      return;
    }

    // 获取购物车列表
    this.getProduct();
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
     // 获取购物车列表
    let that = this;
    app.loginBefore();
  },

  // 获取购物车列表
  getProduct: function(e){
    app.ajax('POST', 'm/shopcart/List', res => {
      let productLists = [];
      let loseProductLists = [];
      // 有效商品
      res.data.result.data.map(value => {
        value.items.map(val => {
          let obj = new Object;
          let total = val.price;
          let totalBig = total.toString().split('.')[0] || total;
          let totalSmall = total.toString().split('.')[1] || '00';

          obj.id = val.id;
          obj.productid = val.productid;
          obj.imgSrc = val.img;
          obj.total = val.price;
          obj.title = val.subject;
          obj.count = val.count;
          obj.stock = val.stocknum == -1 ? 999 : val.stocknum;
          obj.checked = false;
          obj.totalBig = totalBig;
          obj.totalSmall = totalSmall;
          productLists.push(obj)

        })
      })

      // 失效商品
      res.data.result.invalid.map(value => {
        value.items.map(val => {
          let obj = new Object;
          let total = val.price;
          let totalBig = total.toString().split('.')[0] || total;
          let totalSmall = total.toString().split('.')[1] || '00';

          obj.id = val.id;
          obj.productid = val.productid;
          obj.imgSrc = val.img;
          obj.total = val.price;
          obj.title = val.subject;
          obj.totalBig = totalBig;
          obj.totalSmall = totalSmall;
          loseProductLists.push(obj)

        })
      })

      this.setData({
        productLists: productLists,
        loseProductLists: loseProductLists,
        checkedAll: false
      })

      this.calcTotal();

    }, res => {
      wx.showToast({
        icon: 'loading',
        title: res.msg,
      })
    })
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
    // 获取购物车列表
    this.getProduct();
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