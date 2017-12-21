// pages/addAddress/addAddress.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    citys:[],
    addressInfo:{
      name: "", //姓名
      mobile: "", // 电话
      addressN: "请选择", //详细地址1
      addressD: "", //详细地址2
      x:'', // 坐标 x
      y:'', // 坐标 y
      isDefault: false//设为默认地址
    },
    multiArray: [],//地址列表容器
    multiIndex: [0,0,0], //所在地区
    edit: false
  },

  // 选择所在地区
  bindRegionChange: function(e){
    this.data.addressInfo.province_code = this.data.multiArray[0][e.detail.value[0]].code;
    this.data.addressInfo.province_name = this.data.multiArray[0][e.detail.value[0]].name;
    this.data.addressInfo.city_code = this.data.multiArray[1][e.detail.value[1]].code;
    this.data.addressInfo.city_name = this.data.multiArray[1][e.detail.value[1]].name;
    this.data.addressInfo.district_code = this.data.multiArray[2][e.detail.value[2]].code;
    this.data.addressInfo.district_name = this.data.multiArray[2][e.detail.value[2]].name;
    this.setData({
      multiIndex: e.detail.value,
      addressInfo: this.data.addressInfo
    })
  },

  // 三级联动
  bindcolumnchange:function(e){
    console.log(e);
    let column = e.detail.column;
    let value = e.detail.value;
    this.columnchange(column, value);
  },

  columnchange: function (column, value){
    let index = wx.getStorageSync('area') || 0;
    if (column === 0) {
      wx.setStorageSync('area', value);
      let city = this.data.multiArray[0][value].citys;
      let district = this.data.multiArray[0][value].citys[0].districts;
      let multiArray = this.data.multiArray.splice(1, 2, city, district)
      this.setData({
        multiArray: this.data.multiArray
      })
    } else if (column === 1) {
      let district = this.data.multiArray[0][index].citys[value].districts;
      let multiArray = this.data.multiArray.splice(2, 1, district)
      this.setData({
        multiArray: this.data.multiArray
      })
    }
  },

  // 选择详细地址
  addressDetail: function(e){
    wx.chooseLocation({
      success: res => {
        this.data.addressInfo.addressN = res.address;
        this.data.addressInfo.addressD = res.name;
        this.data.addressInfo.x = res.longitude;
        this.data.addressInfo.y = res.latitude;
        this.setData({
          addressInfo: this.data.addressInfo
        })
      },
    })
  },

  // 详细地址补充
  detail: function(e){
    this.data.addressInfo.addressD = e.detail.value;
    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  // 收货人姓名
  addName: function(e){
    this.data.addressInfo.name = e.detail.value;
    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  // 收货人电话
  addMobile: function (e) {
    this.data.addressInfo.mobile = e.detail.value;
    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  // 设为默认地址
  defaultAddress: function(e){
    this.data.addressInfo.isDefault = !this.data.addressInfo.isDefault;
    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  // 保存
  save: function(e){
    let data = new Object;
    data.name = this.data.addressInfo.name;
    data.mobile = this.data.addressInfo.mobile;

    data.isDefault = this.data.addressInfo.isDefault;
    data.x = this.data.addressInfo.x;
    data.y = this.data.addressInfo.y;
    data.tel = '';
    data.code = '';
    data.address = this.data.addressInfo.addressN + '  ' + this.data.addressInfo.addressD;
    data.area = {
      province: {
        code: this.data.addressInfo.province_code,
        name: this.data.addressInfo.province_name,
      },
      city: {
        code: this.data.addressInfo.city_code,
        name: this.data.addressInfo.city_name,
      },
      district: {
        code: this.data.addressInfo.district_code,
        name: this.data.addressInfo.district_name,
      }
    };
    data.change = true;

    if (data.name == ''){
      wx.showToast({
        icon: 'loading',
        title: '请填写收货人',
      })
      return;
    } else if (!app.globalData.phoneReg.test(data.mobile)) {
      wx.showToast({
        icon: 'loading',
        title: '电话格式错误',
      })
      return;
    } else if (data.x == '' || data.y == '') {
      wx.showToast({
        icon: 'loading',
        title: '请选择地址',
      })
      return;
    }
    
    let url = 'm/UserAddr/add'; //添加地址
    if(this.data.edit){
      data.id = this.data.addressInfo.id;
      url = 'm/UserAddr/edit'; //修改地址
    }
    app.ajax('POST', url, data, res => {
      wx.showToast({
        title: '保存成功',
        success: ress => {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }, res => {
      wx.showToast({
        icon: 'loading',
        title: '网络繁忙请重试',
        success: ress => {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 获取省级联动地址列表
    app.ajax('POST','Dict/City2',res => {
      let area = res.data.result;
      let city = res.data.result[0].citys;
      let district = res.data.result[0].citys[0].districts;
      let multiArray = [];
      // // 省
      // res.data.result.map(val => {
      //   area.push(val.name);
      // })

      // // 市
      // res.data.result[0].citys.map(val => {
      //   city.push(val.name)
      // })

      // // 区
      // res.data.result[0].citys[0].districts.map(val => {
      //   district.push(val.name)
      // })
      
      multiArray.push(area);
      multiArray.push(city);
      multiArray.push(district);
      

      let addressInfo = options.addressInfo || false;//是否修改地址
      if (addressInfo) {
        addressInfo = JSON.parse(addressInfo);
        console.log(addressInfo.address.split(' '))
        addressInfo.addressN = "请选择"; //详细地址1
        addressInfo.addressD = addressInfo.address; //详细地址2
        if (addressInfo.address.split(' ').length > 1){
          let split = addressInfo.address.split(' ')
          addressInfo.addressN = split[0];
          addressInfo.addressD = split.slice(2).join(' ');
        }
        let multiIndex = [];

        // 省
        for (let i = 0; i < multiArray[0].length; i++) {
          if (multiArray[0][i].code == addressInfo.province_code) {
            wx.setStorageSync('area', i);
            let city = multiArray[0][i].citys;
            let district = multiArray[0][i].citys[0].districts;
            multiArray.splice(1, 2, city, district)
            multiIndex.push(i)
          }
        }

        // 市
        for (let i = 0; i < multiArray[1].length; i++) {
          if (multiArray[1][i].code == addressInfo.city_code) {
            let district = multiArray[1][i].districts;
            multiArray.splice(2, 1, district)
            multiIndex.push(i)
          }
        }

        // 区
        for (let i = 0; i < multiArray[2].length; i++) {
          if (multiArray[2][i].code == addressInfo.district_code) {
            multiIndex.push(i)
          }
        }


        this.setData({
          addressInfo: addressInfo,
          citys: res.data.result,
          multiIndex: multiIndex,
          multiArray: multiArray,
          edit: true
        })
        
      }else{
        this.data.addressInfo.province_code = multiArray[0][0].code;
        this.data.addressInfo.province_name = multiArray[0][0].name;
        this.data.addressInfo.city_code = multiArray[1][0].code;
        this.data.addressInfo.city_name = multiArray[1][0].name;
        this.data.addressInfo.district_code = multiArray[2][0].code;
        this.data.addressInfo.district_name = multiArray[2][0].name;
        this.setData({
          citys: res.data.result,
          multiArray: multiArray,
          addressInfo: this.data.addressInfo
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