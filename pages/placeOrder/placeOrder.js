// pages/placeOrder/placeOrder.js

const app = getApp();
const ddid = app.globalData.ddid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productLists:[ //商品列表
      {
        productid: 123,
        imgSrc: '../images/12.jpg',
        title: '爱奇果 陕西眉县 猕猴桃12粒装单果90-110g',
        total: "12.00",
        count: 6
      }
    ],
    active:false,// 是否展开所有商品
    shippingMethod: true, //配送方式,
    productListsCount: 0, //商品总数
    total:"0.00", //商品总金额
    freight:"0.00", //运费
    discount:"0.00", //优惠金额 暂时没有接口
    amountTotal:"0.00", //应付金额
    totalBig:"0",
    totalSmall: "00",
    addressInfo:{
      name: "收货人姓名", //姓名
      mobile: "联系电话", //电话
      address: '收货地址',//配送地址
    },
    companyInfo:'' //门店基本信息
  },
  // 展示全部商品
  showAll:function(e){
    let active = this.data.active;
    this.setData({
      active: !active
    })
  },

  // 配送方式
  shippingMethod: function(e){
    let shipping = e.target.dataset.shipping;
    if (shipping == 'true'){
      this.data.shippingMethod = true;
      this.calcTotal(this.data.addressInfo);// 计算运费及实付金额
      this.setData({
        shippingMethod: this.data.shippingMethod
      })
    }else{
      this.data.shippingMethod = false;
      // 计算应付金额
      let amountTotal = parseFloat(this.data.total) + 0 - this.data.discount;
      let totalBig = amountTotal.toFixed(2).toString().split('.')[0];
      let totalSmall = amountTotal.toFixed(2).toString().split('.')[1];
      this.setData({
        shippingMethod: this.data.shippingMethod,
        freight: "0.00",
        amountTotal: amountTotal,
        totalBig: totalBig,
        totalSmall: totalSmall
      })
    }
    
  },

  // 选择地址列表  去地址列表页面
  gotoAddressList:function(e){
    wx.navigateTo({
      url: '../addressList/addressList',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let productLists = [];
    let total = 0;
    let productListsCount = 0;
    let pro = options.pro.split('|'); //页面传递的产品参数
    pro.splice(-1,1);
    pro.map(val => {
      productLists.push(JSON.parse(val));
    });
    productLists.map(val => {
      productListsCount += parseInt(val.count);
      total += (parseFloat(val.total) * parseInt(val.count))
    });
    let totalBig = total.toFixed(2).toString().split('.')[0];
    let totalSmall = total.toFixed(2).toString().split('.')[1];
    this.setData({
      productLists: productLists,
      productListsCount: productListsCount,
      total: total.toFixed(2),
      totalBig: totalBig,
      totalSmall: totalSmall
    })

    console.log(productLists)
    this.address();//同城配送
  },

  // 收货地址
  address: function(e){
    //门店地址坐标
    // ddid 内网 48  外网 703
    app.ajax('POST', 'uc/UserAccount/CompanyInfo', { ddid: ddid }, res => {
      let storeAdd = new Object;
      storeAdd.lng = res.data.result.addrx;
      storeAdd.lat = res.data.result.addry;
      this.setData({
        companyInfo: res.data.result //公司门店信息
      })
      app.ajax('POST', 'm/useraddr/BDList', storeAdd, ress => {
        let addressTrue = [];
        let addressFalse = [];
        let isDefault = true;

        for (let i = 0; i < ress.data.result.length; i++){
          if (ress.data.result[i].isDefault && ress.data.result[i].PostFee.task) { //默认地址 并且是有效配送范围
            this.setData({
              addressInfo: res.data.result[i]
            })
            this.calcTotal(ress.data.result[i]);// 计算运费及实付金额
            isDefault = false;
            break;
          }
        }

        if (isDefault) { //如果没有默认地址 或 默认地址超出配送范围
          for (let i = 0; i < ress.data.result.length; i++) {
            if (ress.data.result[i].PostFee.task) { //默认地址 并且是有效配送范围
              this.setData({
                addressInfo: res.data.result[i]
              })
              this.calcTotal(ress.data.result[i]);// 计算运费及实付金额
              break;
            }
          }
        }

      })
    })
  },

  // 计算运费及实付金额
  calcTotal: function(value){
    app.ajax('POST', 'dsm/order/PostFee', { path: value.PostFee.path }, freight => {

      // 计算应付金额
      let amountTotal = parseFloat(this.data.total) + parseFloat(freight.data.result.fee) - this.data.discount;
      let totalBig = amountTotal.toFixed(2).toString().split('.')[0];
      let totalSmall = amountTotal.toFixed(2).toString().split('.')[1];
      this.setData({
        addressInfo: value,
        freight: parseFloat(freight.data.result.fee).toFixed(2),
        amountTotal: amountTotal,
        totalBig: totalBig,
        totalSmall: totalSmall
      })
    }, freight => {

    })
  },

  // 提交订单
  submitOrder: function(e){
    if (this.data.shippingMethod){ //配送
      let data = new Object;
      let obj = new Object;
      let PsInfo = new Object;
      let p = new Array();
      let items = new Array();
      this.data.productLists.map(value => {
        let itemss = new Object;
        itemss.productid = value.productid;
        itemss.skuid = "0";
        itemss.count = value.count;
        itemss.sendmode = 4;
        items.push(itemss);
      })

      // 门店信息 和 收货人信息
      PsInfo.areaCode = this.data.companyInfo.area.city.code;
      PsInfo.myjOrder = '';
      PsInfo.cityName = this.data.companyInfo.area.city.name;
      PsInfo.itemType = '普通';
      PsInfo.originAddress = this.data.companyInfo.addr;
      PsInfo.originName = this.data.companyInfo.compay;
      PsInfo.originPhone = this.data.companyInfo.phone;
      PsInfo.originX = this.data.companyInfo.addrx;
      PsInfo.originY = this.data.companyInfo.addry;
      PsInfo.path = this.data.addressInfo.PostFee.path;
      PsInfo.pickTime = '立即送达';
      PsInfo.ptid = 0;
      PsInfo.targetAddress = this.data.addressInfo.address;
      PsInfo.targetName = this.data.addressInfo.name;
      PsInfo.targetPhone = this.data.addressInfo.mobile;
      PsInfo.targetX = this.data.addressInfo.x;
      PsInfo.targetY = this.data.addressInfo.y;
      PsInfo.totalFee = this.data.freight;


      obj.ddid = ddid;
      obj.sendmode = 4;
      obj.remark = "";
      obj.items = items;
      obj.PsInfo = PsInfo;
      obj.addrx = this.data.companyInfo.addrx;
      obj.addry = this.data.companyInfo.addry;
      obj.compayName = this.data.companyInfo.compay;
      obj.duid = 4982;
      obj.originAddress = this.data.companyInfo.addr;
      obj.phone = this.data.companyInfo.phone;
      p.push(obj);

      data.p = p;
      data.payment = "wechat";
      data.receiveAddress = this.data.addressInfo.address;
      data.receiveName = this.data.addressInfo.name;
      data.receivePhone = this.data.addressInfo.mobile;
      data.requireAddr = true;
      app.ajax('POST', 'ShopCart/GenOrder', {model: data}, res => {
        app.payment(res.data.result[1]);//发起微信支付
      }, res => {
        wx.showToast({
          icon: 'loading',
          title: '订单提交失败',
        })
      })
    }else{//自提
      let data = new Object;
      let obj = new Object;
      let p = new Array();
      let items = new Array();
      this.data.productLists.map(value => {
        let itemss = new Object;
        itemss.productid = value.productid;
        itemss.skuid = "0";
        itemss.count = value.count;
        itemss.sendmode = 1;
        items.push(itemss);
      })
      obj.ddid = ddid;
      obj.sendmode = 1;
      obj.remark = "备注";
      obj.items = items;
      p.push(obj);
      data.p = p;
      data.payment = "wechat";
      data.requireAddr = false;
      data.sendddid = ddid;
      app.ajax('POST', 'm/order/Add', data, res => {
        app.payment(res.data.result[0]);//发起微信支付
      }, res => {
        wx.showToast({
          icon: 'loading',
          title: '订单提交失败',
        })
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
    let address = wx.getStorageSync('address') || false;
    if (address){
      this.setData({
        addressInfo: JSON.parse(address)
      })
      this.calcTotal(JSON.parse(address));// 计算运费及实付金额
      wx.removeStorageSync('address');

    }
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