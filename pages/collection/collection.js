// pages/collection/collection.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loseProductLists: [ //收藏商品列表
      
    ],
    cartNumber: 6,
    touch_start:'',
    touch_end: '',
    pageIndex: 1, //加载页数
    more: false //显示没有更多了...
  },

  // 查看商品详情 或 取消收藏
  productDetail: function(e){
    let id = e.currentTarget.dataset.id;
    let scid = e.currentTarget.dataset.scid;
    let index = e.currentTarget.dataset.index;
    let that = this;
    //触摸时间距离页面打开的毫秒数  
    let touchTime = that.data.touch_end - that.data.touch_start;
    //如果按下时间大于350为长按  长按取消收藏
    if (touchTime > 350) {
      wx.showModal({
        title: '提示',
        content: '确认取消收藏？',
        success: res => {
          if (res.confirm) {
            app.ajax('POST', 'm/collect/del', { productid: scid}, res => {
              this.data.loseProductLists.splice(index,1)
              this.setData({
                loseProductLists: this.data.loseProductLists
              })
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../productDetail/productDetail?id=' + id,
      })
    }

  },

  // 加入购物车
  addCart:function(e){
    let id = e.currentTarget.dataset.scid;

    // 获取商品详情
    app.ajax('POST', 'm/Product/JsonDetail', { id: id }, res => {
      let shop_count = res.data.result.row.shop_count;
      let mpcount = res.data.result.row.mpcount == '-1' ? 999 : res.data.result.row.mpcount;
      if (mpcount > shop_count){
        app.ajax('POST', 'm/ShopCart/Add', { productid: res.data.result.row.id, count: 1, sendmode: 1}, ress => {
          this.setData({
            cartNumber: ++this.data.cartNumber
          })
          wx.showToast({
            title: '加入购物车成功',
          })
        }, ress => {
          wx.showToast({
            icon: 'loading',
            title: '网络繁忙'
          })
        })
      }else{
        wx.showToast({
          icon: 'loading',
          title: '库存不足',
        })
      }
    },res => {
      wx.showToast({
        icon:'loading',
        title:'网络繁忙'
      })
    })
    
  },

  // 去购物车
  goToCart: function () {
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.ajax('POST', 'm/ShopCart/Count', count => {
      this.setData({
        cartNumber: count.data.result
      })
    }, count => {

    })

    this.loading(1,10)
  },

  // 加载收藏列表

  loading: function (pageIndex, pageSize){
    app.ajax('POST', 'm/Collect/List_Shop', { pageIndex: pageIndex, pageSize: pageSize }, res => {
      let loseProductLists = this.data.loseProductLists;
      res.data.result.data.map(val => {
        let obj = new Object;
        obj.title = val.name;//商品名称
        obj.imgSrc = val.image; //商品图片
        obj.id = val.id;//商品  id
        obj.scid = val.scid; //商品收藏 id   用于取消收藏等
        obj.duid = val.duid;
        obj.date = val.date;//收藏日期
        obj.rowId = val.rowId;
        obj.price = val.price;//单价
        let total = val.price.toFixed(2).toString().split('.');
        obj.totalBig = total[0];
        obj.totalSmall = total[1];
        loseProductLists.push(obj);
      })
      this.setData({
        loseProductLists: loseProductLists,
        pageIndex: ++this.data.pageIndex
      });
      if (pageIndex * 10 > res.data.result.total){
        this.setData({
          more: true
        })
      }
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
    this.setData({
      loseProductLists:[]
    })
    this.loading(1, 10);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.more){
      this.loading(this.data.pageIndex, 10);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})