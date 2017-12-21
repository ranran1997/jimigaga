// pages/orderList/orderList.js
const app = getApp();
const ddid = app.globalData.ddid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderState: [
      {
        stateStr: "全部",
        state: '',
        active: true
      },
      {
        stateStr: "待付款",
        state: 0,
        active: false
      },
      {
        stateStr: "待发货",
        state: 1,
        active: false
      },
      {
        stateStr: "待收货",
        active: false,
        state: 2
      },
      {
        stateStr: "已完成",
        active: false,
        state: 3
      }
    ],
    orderList: [
      // {
      //   stateStr: '待收货',
      //   store: '吉米呷呷晋江安海店',
      //   product: [
      //     {
      //       image: '../images/12.jpg',
      //       name: '四季播小青菜春播蔬菜籽阳台种菜易种原种上海青台湾无农药上海青',
      //       price: '8.99',
      //       count: '2',
      //       productid:''
      //     }
      //   ],
      //   numberCalc: '4',
      //   total: '100.00',
      //   freight: '6.00',
      //   actionOne: '确认收货',
      //   actionTwo: '查看配送'
      // }
    ],
    pageIndex:1 //订单列表当前页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let state = options.state;
    this.data.orderState.map(val => {
      if (val.state == state){
        val.active = true;
      }else{
        val.active = false;
      }
    })
    this.setData({
      orderState: this.data.orderState
    })
    this.getOrder(state,1);
  },

  //获取订单列表
  getOrder: function(state,pageIndex){
    app.ajax('POST', 'erp/VipBuyer/BuyersOrderList', { state: state, ddid: ddid, pageIndex: pageIndex, pageSize: 10 }, res => {
      
      res.data.result.data.map(val => {
        let obj = new Object;
        obj.stateStr = val.stateName;//订单状态
        obj.state = val.state;//订单状态
        if (val.state == 0){
          obj.actionOne = '付款';
          obj.actionTwo = '取消订单';
        }
        obj.store = val.compayName;//门店名称
        obj.freight = val.deliveryPrice.toFixed(2);//运费
        obj.total = val.totalFee.toFixed(2);//总价
        obj.number = val.number;//订单号
        obj.numberCalc = 0;// 商品数量
        val.items.map(value => {
          obj.numberCalc += value.count;// 商品数量
        });
        obj.product = val.items;// 商品参数
        this.data.orderList.push(obj);
      })

      this.setData({
        orderList: this.data.orderList,
        pageIndex: ++pageIndex
      })
     
    })
  },

  // 切换订单
  triggleOrder: function(e){
    let index = e.currentTarget.dataset.index;
    this.data.orderState.map((val, i) => {
      if (index == i) {
        val.active = true;
      } else {
        val.active = false;
      }
    })
    this.setData({
      orderState: this.data.orderState,
      orderList: [],
      pageIndex: 1
    })
    this.getOrder(this.data.orderState[index].state, 1);
    console.log(index)
  },

  // 取消订单
  cancelOrder: function(e){
    let index = e.currentTarget.dataset.index;
    let numberid = this.data.orderList[index].number;
    wx.showModal({
      title: '取消订单',
      content: '是否确认取消',
      success: res => {
        if(res.confirm){
          app.ajax('POST', 'm/Order/Close', { 'number': numberid}, res => {
            this.data.orderList.splice(index,1);
            this.setData({
              orderList: this.data.orderList
            })
            wx.showToast({
              title: '取消成功'
            })
          }, res => {
            wx.showToast({
              icon:'loading',
              title:'网络繁忙请重试'
            })
          })
        }
      }
    })
  },

  // 订单详情
  orderDetail: function(e){
    let index = e.currentTarget.dataset.index;
    let numberid = this.data.orderList[index].number;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?numberid=' + numberid,
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
    for (let i = 0; i < this.data.orderState.length; i++){
      if (this.data.orderState[i].active){
        this.getOrder(this.data.orderState[i].state, 1);
        break;
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    for (let i = 0; i < this.data.orderState.length; i++) {
      if (this.data.orderState[i].active) {
        this.getOrder(this.data.orderState[i].state, this.data.pageIndex);
        break;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})