var express = require('express');
var router = express.Router();
const adminMiddleware = require('../middlewares/adminMiddleware')
const adminController = require('../controller/adminController')
const { upload } = require('../server/multer');
const { route } = require('./users');


/* GET home page. */
router.get('/', adminMiddleware.verifyLogout, adminController.home);

/* GET login page. */

router.get('/login', adminController.getLogin)
router.post('/login', adminController.postLogin)

/* GET Logout page. */

router.get('/logout', adminController.logout)

/* GET user page. */
router.get('/users', adminMiddleware.verifyLogout, adminController.getUSer)


/*  user Block. */

router.get('/block-user/:id', adminController.blockUser)

/*  user Unblock. */

router.get('/unblock-user/:id', adminController.unblockUSer)

/* GET product page. */

router.get('/products', adminMiddleware.verifyLogout, adminController.getProducts)


/* Add product page. */

router.post('/addProduct', upload.array('image'), adminController.addProduct)

/* Delete product page. */


router.delete('/delete-product/:id', adminMiddleware.verifyLogout, adminController.deleteProduct)

/* Edit product page. */

router.get('/edit-product/:id', adminController.editProductId)

router.get('/edit-product', adminMiddleware.verifyLogout, adminController.editProduct)





router.post('/edit-product/:id', upload.array('image'), adminController.postEdit)



/* Product category page. */

router.get('/category', adminMiddleware.verifyLogout, adminController.getCat)

router.post('/category', adminController.postCat)


router.get('/brands', adminMiddleware.verifyLogout, adminController.getBrand)

router.post('/brands', upload.array('image'), adminController.newBrand)

/* Order Management page. */
router.get('/orders', adminMiddleware.verifyLogout, adminController.order)

router.get('/banners', adminMiddleware.verifyLogout, adminController.banner)

router.post('/add-banner', upload.array('image'), adminController.addBanner)

router.get('/edit-banner/:id', adminMiddleware.verifyLogout, adminController.editBanner)

router.get('/edit-banner', adminMiddleware.verifyLogout, adminController.getEditBanner)

router.post('/edit-banner/:id', upload.array('image'), adminMiddleware.verifyLogout, adminController.postEditBanner)

router.get('/delete-banner/:id', adminMiddleware.verifyLogout, adminController.deleteBanner)

router.post('/status/change/', adminMiddleware.verifyLogout, adminController.statusChange)

router.get('/orders/details/:id', adminMiddleware.verifyLogout, adminController.orderDetails)

router.get('/orders/details', adminMiddleware.verifyLogout, adminController.getorderDetails)

router.get('/coupons', adminMiddleware.verifyLogout, adminController.coupon)

router.post('/add/coupon', adminMiddleware.verifyLogout, adminController.addCoupon)

router.get('/product/offers', adminMiddleware.verifyLogout, adminController.productoffer)

router.post('/product/offers', adminMiddleware.verifyLogout, adminController.postproductoffer)

router.get('/delete/product/offer/:id', adminMiddleware.verifyLogout, adminController.deleteproductOffer)

router.get('/brand/offers', adminMiddleware.verifyLogout, adminController.brandOffer)

router.post('/brand/offers', adminMiddleware.verifyLogout, adminController.postBrandOffer)

router.get('/delete/brand/offers/:id', adminMiddleware.verifyLogout, adminController.deleteBrandOffer)

router.patch('/statuschange/', adminMiddleware.verifyLogout, adminController.orderStatus)

router.patch('/approveReturn', adminMiddleware.verifyLogout, adminController.approveReturn)

router.get('/sales/report', adminMiddleware.verifyLogout, adminController.salesReport)

module.exports = router;  
