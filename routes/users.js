var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelper')
var productHelper = require('../helpers/productHelper')
var categoryHelper = require('../helpers/categoryHelper')
var otpconfig = require('../config/otpconfig')
const { Client } = require('twilio/lib/twiml/VoiceResponse');
const userController = require('../controller/userController')
var userMiddleware = require('../middlewares/userMiddleware');
let client = require('twilio')(otpconfig.accountId, otpconfig.authToken)
var paypal = require('paypal-rest-sdk');
const refferalHelper = require('../helpers/referralHelper')

const CC = require('currency-converter-lt')
let currencyConverter = new CC()
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AQikqlyld8L5iXjmi5hGQSB8GdA3IjealDynhGYDrSUeJxWYVCUwQ_dNjd4_zJHDBwKkXZtKHxXbN1dG',
  'client_secret': 'EJIZL6c-OE6eh9Klw4rOcRT763UolwjLSeM8X2ON1dhmr-ZDzUn9DQlzmBo7F2qNP4XmmW4GOGfp5sng'
});


/* GET users listing. */
router.get('/', userController.home);

router.get('/login', userController.getLogin);

router.post('/login', userController.postLogin);

router.get('/logout', userController.logout)



router.post('/signup', userController.postSignup);


router.get('/login/otp', userController.otpLoginGet)

router.post('/login/otp', userController.otpLoginpPost)

router.get('/login/otpverify', userController.getOtpVerify)

router.post('/login/otpverify', userController.postOtpVerify)

router.get('/quickview/:id', userController.quickView)

router.get('/category/brand/:id', userController.category)

router.get('/shop', userController.shop)

router.get('/cart', userMiddleware.verifyLogin, userController.cart)


router.get('/add-to-cart/:id', userMiddleware.verifyLogin, userController.addToCart)

router.get('/remove-from-cart/:id', userMiddleware.verifyLogin, userController.removeFromCart)

router.get('/add-to-wishlist/:id', userMiddleware.verifyLogin, userController.addToWishlist)

router.get('/wishlist', userMiddleware.verifyLogin, userController.wishlist)

router.get('/remove-from-wishlist/:id', userController.removeFromWishlist)

router.get('/move-to-cart/:id', userMiddleware.verifyLogin, userController.moveToCart)

router.post('/change-product-quantity', userMiddleware.verifyLogin, userController.changeProductQuantity)

router.get('/checkout', userMiddleware.verifyLogin, userController.checkout)

router.post('/place-order', userMiddleware.verifyLogin, userController.placeOrder)

router.get('/confirm-order', userMiddleware.verifyLogin, userController.confirmOrder)

router.post('/add-address', userMiddleware.verifyLogin, userController.addAddress)

router.get('/orders', userMiddleware.verifyLogin, userController.orders)

router.post('/orders/more', userMiddleware.verifyLogin, userController.postOrder)




router.get('/odered-products/:id', userMiddleware.verifyLogin, userController.orderedProducts)

router.get('/product/:id', userController.product)


router.post('/verify-payment', userController.verifyAmount)

router.get('/success', userController.success);

router.post('/coupon-submit', userMiddleware.verifyLogin, userController.postCoupon)


router.get('/cancel-item/:id', userMiddleware.verifyLogin, userController.cancelItem)

router.patch('/returnOrder', userMiddleware.verifyLogin, userController.returnOrder)

router.get('/myaccount', userMiddleware.verifyLogin, userController.myAccount)

router.post('/myaccount/change/details/:id', userMiddleware.verifyLogin, userController.changeDetails)

router.post('/myaccount/change/password/:id', userMiddleware.verifyLogin, userController.changePassword)

router.post('/search', userController.search)
module.exports = router;


