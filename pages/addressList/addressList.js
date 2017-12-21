// pages/addressList/addressList.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    edit:false,//判断路径  是否是我的地址管理页面进来的
    addressTrue:[
      {
        name: "张三",
        mobile: "15859540251",
        address: "石狮市鸿山镇高新区创新创业中心1栋7楼福建省创企信息科技有限公司",
        id:'',
        isDefault:true
      }
    ],
    addressFalse: [
      {
        name: "张三",
        mobile: "15859540251",
        address: "石狮市鸿山镇高新区创新创业中心1栋7楼福建省创企信息科技有限公司",
        id: ''
      }
    ]
  },

  // 新增地址 跳转
  addAddress:function(e){
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },

  // 地址选中
  addressCheck:function(e){
    if(this.data.edit){
      return;
    }
    let index = e.currentTarget.dataset.index;
    let address = this.data.addressTrue[index];
    wx.setStorageSync('address', JSON.stringify(address))
    wx.navigateBack({
      delta: 1
    })

  },

  // 设置默认地址
  radioChange:function(e){
    let index = parseInt(e.detail.value);
    let addressId = this.data.addressTrue[index].id;
    app.ajax('POST', 'm/UserAddr/setdefault', { id: addressId}, res => {
      this.data.addressTrue.map((value, key) => {
        if (key == index) {
          value.isDefault = true;
        } else {
          value.isDefault = false;
        }
      });
      this.setData({
        addressTrue: this.data.addressTrue
      })
    })

    
  },

  // 删除地址
  deleteAddress:function(e){
    let index = e.currentTarget.dataset.index;
    let addressId = this.data.addressTrue[index].id;
    
    wx.showModal({
      title: '提示',
      content: '删除地址',
      success:res => {
        if(res.confirm){
          app.ajax('POST', 'm/UserAddr/del', { id: addressId }, res => {
            this.data.addressTrue.splice(index,1);
            this.setData({
              addressTrue: this.data.addressTrue
            })
          })
        }
      }
    })
  },

  // 修改地址
  editAddress:function(e){
    let index = parseInt(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '../addAddress/addAddress?addressInfo=' + JSON.stringify(this.data.addressTrue[index]),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.edit){
      this.setData({
        edit: true
      })
    }

  //门店地址坐标
    // ddid 内网 48  外网 703
    app.ajax('POST', 'uc/UserAccount/CompanyInfo', { ddid: 48 }, res => {
      let storeAdd = new Object;
      storeAdd.lng = res.data.result.addrx;
      storeAdd.lat = res.data.result.addry;
      app.ajax('POST', 'm/useraddr/BDList', storeAdd, ress => {
        let addressTrue = [];
        let addressFalse = [];
        ress.data.result.map(value => {
          if (this.data.edit){
            addressTrue.push(value);
          }else{
            if (value.PostFee.task) {
              addressTrue.push(value);
            } else {
              addressFalse.push(value);
            }
          }
        })

        this.setData({
          addressTrue: addressTrue,
          addressFalse: addressFalse
        })
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
    //门店地址坐标
    // ddid 内网 48  外网 703
    app.ajax('POST', 'uc/UserAccount/CompanyInfo', { ddid: 48 }, res => {
      let storeAdd = new Object;
      storeAdd.lng = res.data.result.addrx;
      storeAdd.lat = res.data.result.addry;
      app.ajax('POST', 'm/useraddr/BDList', storeAdd, ress => {
        let addressTrue = [];
        let addressFalse = [];
        ress.data.result.map(value => {
          if (this.data.edit) {
            addressTrue.push(value);
          } else {
            if (value.PostFee.task) {
              addressTrue.push(value);
            } else {
              addressFalse.push(value);
            }
          }
        })

        this.setData({
          addressTrue: addressTrue,
          addressFalse: addressFalse
        })
      })
    })
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