//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiperImgs:[ //banner 图
      {
        img: '../images/banner-2-x.jpg'
      },
      {
        img: '../images/banner.jpg'
      }
    ],
    productClass:[ //产品分类
      {
        name: '全部',
        id:'all',
        active:true
      },
      {
        name: '新鲜水果',
        id: 'all2',
        active:false
      },
      {
        name: '冰冻速食',
        id: 'all3',
        active: false
      },
      {
        name: '水果',
        id: 'all4',
        active: false
      },
      {
        name: '粗粮',
        id: 'all5',
        active: false
      },
      {
        name: '糕点',
        id: 'all6',
        active: false
      },
      {
        name: '蔬菜2',
        id: 'all7',
        active: false
      },
    ],
    toView:'all',
    scrollLeft:0,
    productLists:[
      {
        imgUrl:'../images/16.jpg',
        description: '精选自云南鲜银耳，会呼吸的“活”银耳加11.9换购新疆灰枣 2Kg',
        total:38.5,
        oldTotal:'45.00',
        id:'ssssssss1'
      },
      {
        imgUrl: '../images/16.jpg',
        description: '精选自云南鲜银耳，会呼吸的“活”银耳加11.9换购新疆灰枣 2Kg',
        total: 38.5,
        oldTotal: '45.00',
        id: 'ssssssss2'
      },
      {
        imgUrl: '../images/16.jpg',
        description: '精选自云南鲜银耳，会呼吸的“活”银耳加11.9换购新疆灰枣 2Kg',
        total: 38.5,
        oldTotal: '45.00',
        id: 'ssssssss3'
      }
    ],
    pageIndex:1,//商品当前页数
    pageTotal:''//商品总数
  },

  // 搜索商品
  search:function(e){
    wx.navigateTo({
      url: '../search/search',
    });
  },

  //产品分类选择
  selectProduct:function(e){
    let that = this;
    let index = e.target.dataset.index;
    let id = e.target.dataset.id;
    that.data.productClass.map((value, i) => {
      
      if(i === index){
        value.active = true;
      }else{
        value.active = false;
      }

    })
    that.setData({
      productClass: that.data.productClass,
      productLists: [],
      pageIndex: 1
    })

    that.getProduct({ pageIndex: 1, pageSize: 10, type_id: id }, that)
    
  },

  onLoad: function () {
    let that = this;
    let userid = wx.getStorageSync('USERID') || false;
    if (userid){
      app.ajax('POST','m/login/WeChat',{duid:userid}, res => {},res => {})
    }
    // banner图
    app.ajax('POST','CompanyInfo/AdvertList', res => {
      that.setData({
        swiperImgs: res.data.result
      })
    }, res => {});

    // 商品分类列表
    app.ajax('POST','m/CompanyInfo/Producttype', res => {
      let productClass = [];
      res.data.result.data.map((value,index) => {
        let obj = new Object;
        obj.active = false;
        obj.id = value.id;
        obj.name = value.name;
        if(index === 0){
          obj.active = true;
        }
        productClass.push(obj);
      })
      that.setData({
        productClass: productClass,
        productLists: []
      })
    });

    that.getProduct({ pageIndex: 1, pageSize: 10 },that)

  },
  // 进入商品详情页
  goToProductDetail:function(e){
    let productId = e.currentTarget.dataset.productId;//商品id
    wx.navigateTo({
      url: '../productDetail/productDetail?productId=' + productId,
    })
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
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    let data = new Object;
    data.pageIndex = 1;
    data.pageSize = 10;
    that.data.productClass.map(value => {
      if(value.active){
        data.type_id = value.id;
      }
    });
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
    if (that.data.pageTotal >= that.data.pageIndex * 10){
      data.pageIndex = that.data.pageIndex;
      data.pageSize = 10;
      that.data.productClass.map(value => {
        if (value.active) {
          data.type_id = value.id;
        }
      });
      that.getProduct(data, that);
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
