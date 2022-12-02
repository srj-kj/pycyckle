var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/productHelper')
const userHelper = require('../helpers/userHelper')
const adminHelper = require('../helpers/adminHelper')
const categoryHelper = require('../helpers/categoryHelper');
const chartHelper = require('../helpers/chartHelper');
const bannerHelper = require('../helpers/bannerHelper');

let status = null
var id;

module.exports = {
  home: async (req, res, next) => {

    let cod = await chartHelper.totalCodSales()
    let razorpay = await chartHelper.totalRazorpaySales()
    let paypal = await chartHelper.totalPaypalSales()
    let totalRevenue = cod[0].CodTotal + razorpay[0].razorpayTotal + paypal[0].paypalTotal
    console.log(cod);
    console.log(razorpay);
    console.log(paypal);
    console.log('----total revenue-----------');
    console.log(totalRevenue);
    console.log('----total revenue-----------');


    let getTotalSalesGraph = await chartHelper.getTotalSalesGraph()
    let dailySalesReport = await chartHelper.getDailySalesReport()
    let monthlySalesReport = await chartHelper.getMonthlySalesReport()
    let yearlySalesReport = await chartHelper.getYearlySalesReport()

    console.log('----total getTotalSalesGraph-----------');
    console.log(getTotalSalesGraph);
    console.log('----total getTotalSalesGraph-----------');

    res.render('admin/admin-home', { admin, cod, razorpay, paypal, totalRevenue, dailySalesReport, monthlySalesReport, yearlySalesReport, getTotalSalesGraph });

  },
  postLogin: (req, res) => {
    const credentials = {
      userName: 'admin@gmail.com', password: 'admin@123'
    }

    if (req.body.username == credentials.userName && req.body.password == credentials.password) {
      req.session.adminLogged = true;
      admin = req.session.adminLogged;
      res.redirect('/admin')
    }
    else {
      req.session.adminErr = true
      res.redirect('/admin')
    }

  },
  getLogin: (req, res) => {
    if (req.session.adminLogged) {
      res.redirect('/admin')
    }
    res.render('admin/admin-login', { adminErr: req.session.adminErr })
    req.session.adminErr = false

  },
  getUSer: (req, res) => {
    userHelper.getAllusers().then((users) => {
      console.log(users)
      res.render('admin/users', { admin, users, updateErr: req.session.updateErr });
      req.session.updateErr = false
    })

  },
  getProducts: async (req, res) => {
    let brands = await categoryHelper.getAllBrands()
    let categories = await categoryHelper.getAllCategory()
    console.log('-------------------brand is here--------------');
    console.log(brands);
    console.log('-------------------brand is here--------------');
    console.log('-------------------brand is here--------------');
    console.log(categories);
    console.log('-------------------brand is here--------------');

    productHelper.getAllProducts().then((products) => {

      res.render('admin/products', { admin, products, brands, categories })
    })
  },


  addProduct: (req, res) => {
    console.log(req.body);

    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const product = req.body
    product.img = fileName
    productHelper.addProduct(product).then((data) => {

      res.redirect('/admin/products')

    })



  },
  deleteProduct: (req, res) => {
    let productId = req.params.id
    console.log(productId);
    productHelper.deleteProducts(productId).then((response) => {
      res.json({ status: true })
    })
  },


  editProductId: async (req, res) => {
    // let product = await productHelper.getProductDetails(req.params.id)
    id = req.params.id
    console.log(id)
    res.redirect('/admin/edit-product')
  },
  editProduct: async (req, res) => {
    let product = await productHelper.getProductDetails(id)
    let brands = await categoryHelper.getAllBrands()
    let cate = await categoryHelper.getCat(product[0].category._id)
    console.log(product);
    res.render('admin/edit-product', { admin, product, brands, cate })
  },




  blockUser: (req, res) => {
    let userId = req.params.id
    console.log(userId);
    adminHelper.blockUSer(userId).then((response) => {
      res.redirect('/admin/users')
    })
  },

  unblockUSer: (req, res) => {
    let userId = req.params.id
    console.log(userId);
    adminHelper.unblockUSer(userId).then((response) => {
      res.redirect('/admin/users')
    })
  },
  postEdit: (req, res) => {
    console.log("its entering routr");

    let id = req.params.id
    console.log(req.body);

    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const product = req.body
    product.img = fileName
    productHelper.updateProduct(id, product).then(() => {


      res.redirect('/admin/products')
    })


  },
  getCat: (req, res) => {
    categoryHelper.getAllCategory().then((category) => {
      console.log(category);
      res.render('admin/category', { admin, category, catErr: req.session.updateErr });
      req.session.catErr = false
    })

  },
  postCat: (req, res) => {
    catId = req.body
    categoryHelper.newCategory(req.body).then((data) => {
      console.log(data)

      if (data.catExist) {

        req.session.catExist = true;
        req.session.catErr = true
        res.redirect('/admin/category');
      } else {
        // console.log(response)
        res.redirect('/admin/category')
        req.session.catErr = false

      }

    })
  },
  getBrand: (req, res) => {

    categoryHelper.getAllBrands().then((brand) => {
      console.log(brand);
      res.render('admin/brands', { admin, brand, brandErr: req.session.brandErr });
      req.session.brandErr = false
    })

  },
  newBrand: (req, res) => {

    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const brand = req.body
    brand.img = fileName
    categoryHelper.newBrand(brand).then((data) => {
      console.log(data)

      if (data.brandExist) {

        req.session.brandExist = true;
        req.session.brandErr = true
        res.redirect('/admin/brands');
      } else {
        // console.log(response)
        res.redirect('/admin/brands')
        req.session.brandErr = false

      }

    })
  },
  order: (req, res) => {
    userHelper.getAllOrders().then((orders) => {
      console.log('==============================');

      console.log(orders);

      console.log('==============================');
      res.render('admin/order', { admin, orders })
    })
  },
  banner: (req, res) => {

    bannerHelper.getAllBanners().then((banners) => {
      console.log(banners);
      res.render('admin/banners', { admin: true, banners })
    })


  },
  addBanner: (req, res) => {
    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const banner = req.body
    banner.img = fileName
    bannerHelper.addBanner(banner).then(() => {
      res.redirect('/admin/banners')
    })

  },
  editBanner: (req, res) => {
    // let product = await productHelper.getProductDetails(req.params.id)
    id = req.params.id
    console.log(id)
    res.redirect('/admin/edit-banner')
  },
  getEditBanner: (req, res) => {
    console.log('call is coming here banners');
    bannerHelper.getBanner(id).then((banner) => {
      console.log(banner)
      res.render('admin/edit-banner', { admin: true, banner })
    })
  },
  postEditBanner: async (req, res) => {
    let id = req.params.id
    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const banner = req.body
    banner.img = fileName
    await bannerHelper.editBanner(id, banner).then(() => {
      res.redirect('/admin/banners')
    })
  },
  deleteBanner: (req, res) => {
    let id = req.params.id
    bannerHelper.deleteBanner(id).then(() => res.redirect('/admin/banners'))

  },
  statusChange: (req, res) => {
    userHelper.changeOrderStatus(req.body).then(() => res.json({ status: true }))
  },
  orderDetails: (req, res) => {
    // let product = await productHelper.getProductDetails(req.params.id)
    id = req.params.id
    console.log(id)
    res.redirect('/admin/orders/details')
  },
  getorderDetails: async (req, res) => {

    let products = await userHelper.getOrderedProducts(id)
    let order = await userHelper.getOrderList(id)
    let total = await userHelper.totalProductsValue(id)
    let address = await userHelper.shippingAddress(id)

    res.render('admin/view-order', { admin: true, order, products, total, address })
  },
  coupon: (req, res) => {
    productHelper.getAllCoupons().then((coupons) => {
      console.log(coupons);
      var today = new Date();
      let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate())

      let expdate = new Date(coupons.exp - date)
      console.log(date);
      console.log(coupons.exp - date);
      if (date <= expdate) {
        console.log('active');
        let status = true
      } else {
        console.log('expired');
        let status = false
      }
      console.log(status);
      res.render('admin/coupon', { admin: true, coupons, status })
    })
  },
  addCoupon: (req, res) => {
    console.log(req.body)
    productHelper.addCoupon(req.body).then((coupon) => {
      res.redirect('/admin/coupons')
    })
  },
  productoffer: async (req, res) => {
    productHelper.getAllProducts().then((products) => {
      res.render('admin/offers', { admin: true, products: products })
    })
  },
  postproductoffer: async function (req, res) {
    console.log("+++++++++++++++++++++++++++++++++");
    console.log(req.body);
    productHelper.setProductOffer(req.body)
    res.json({ status: true })
  },
  deleteproductOffer: (req, res) => {
    let proId = req.params.id
    console.log("!!!!!!!!!!!!!!!!!!!!!");
    console.log(proId);
    productHelper.deleteProductOffer(proId).then((response) => {
      console.log("#########");
      console.log(response);
      res.json({ status: true })
    })
  },
  brandOffer: async (req, res) => {
    categoryHelper.getAllBrands().then((brands) => {
      console.log(brands);
      res.render('admin/brandoffer', { admin: true, brands })
    })
  },
  postBrandOffer: async function (req, res) {
    console.log("+++++++++++++++++++++++++++++++++");
    console.log(req.body);
    productHelper.setBrandOffer(req.body)
    res.json({ status: true })
  },
  deleteBrandOffer: (req, res) => {
    let brandId = req.params.id
    console.log("!!!!!!!!!!!!!!!!!!!!!");
    console.log(brandId);
    productHelper.deleteBrandOffer(brandId).then((response) => {
      console.log("#########");
      console.log(response);
      res.json({ status: true })
    })
  },
  orderStatus: (req, res) => {
    console.log(req.body);
    userHelper.changeOrderStatus(req.body).then((response) => {
      res.json({ status: true })
    })
  },
  approveReturn: (req, res) => {
    console.log(req.body);
    userHelper.approveReturn(req.body.orderId).then(async (order) => {
      console.log('-----approved order-------');
      console.log(order)
      console.log('-----approved order-------');

      userHelper.refundToWallet(order._id, order.userId)
      let product = await productHelper.returnQuantity(order._id)

      console.log('-----approved product-------');
      console.log(product)
      console.log('-----approved product-------');
      console.log(product[0].quantity);
      productHelper.incProduct(product[0].item, product[0].quantity)

      res.json({ status: true })
    })
  },
  salesReport: async (req, res) => {
    let dailySalesReport = await chartHelper.getDailySalesReport()
    let monthlySalesReport = await chartHelper.getMonthlySalesReport()
    let yearlySalesReport = await chartHelper.getYearlySalesReport()
    let getDailySalesTotal = await chartHelper.getDailySalesTotal()


    res.render('admin/salesreport', { dailySalesReport, monthlySalesReport, yearlySalesReport, getDailySalesTotal, admin })
  },
  logout: (req, res) => {
    req.session.adminLogged = ""
    res.redirect('/admin')
  }

}