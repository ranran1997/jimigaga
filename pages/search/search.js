// pages/search/search.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKey:'', // 搜索关键字
    history: [],// 历史记录
    productLists: [ //产品列表
      
    ],
    pageIndex: 1,//商品当前页数
    pageTotal: ''//商品总数
  },

  // 搜索
  search: function(e) {
    let that = this;

    let data = new Object;
    data.title = e.detail.value;
    
    data.pageIndex = 1;
    data.pageSize = 10;
    if (data.title){
      if (that.data.history.indexOf(data.title) === -1){
        that.data.history.push(data.title)
          that.setData({
            history: that.data.history,
            searchKey: e.detail.value
          })
          // 将搜索关键词存入缓存
          wx.setStorage({
            key: 'history',
            data: that.data.history.join(',')
          })
      }
      
      that.getProduct(data, that);//查找商品
    }
    console.log(that.data.history)
  },

  // 清空搜索记录
  clearHistory: function(e) {
    this.setData({
      history: []
    });
    wx.removeStorage({
      key: 'history'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取缓存中的历史搜索记录
    let history = wx.getStorage({
      key: 'history',
      success: res => {
        return res.data
      }
    })
    if (history){
      console.log(history)
      that.setData({
        history: history.split(',')
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
    let that = this;
    let data = new Object;
    data.pageIndex = 1;
    data.pageSize = 10;
    data.title = that.data.searchKey
    that.setData({
      productLists: [],
      pageIndex: 1
    })
    that.getProduct(data, that);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let data = new Object;
    if (that.data.pageTotal >= that.data.pageIndex * 10) {
      data.pageIndex = that.data.pageIndex;
      data.pageSize = 10;
      data.title = that.data.searchKey
      that.getProduct(data, that);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // 商品列表
  getProduct: (data, that) => {
    app.ajax('POST', 'm/CompanyInfo/ProductList', data, res => {
      let productLists = that.data.productLists;
      res.data.result.data.map(value => {
        let obj = new Object;
        obj.imgUrl = value.image;
        obj.description = value.name;
        obj.total = value.price;
        obj.oldTotal = value.storePrice;
        obj.id = value.id;
        productLists.push(obj)
      });
      that.setData({
        productLists: productLists,
        pageIndex: ++that.data.pageIndex,
        pageTotal: res.data.result.total
      })
    })
  }
})