var express = require('express');
var router = express.Router();

const productHelper = require('../helpers/productHelper')
const categoryHelper = require('../helpers/categoryHelper')
const refferalHelper = require('../helpers/referralHelper')
const addressHelper = require('../helpers/addressHelper');



const bannerHelper = require('../helpers/bannerHelper')
const userHelper = require('../helpers/userHelper')
const { Client } = require('twilio/lib/twiml/VoiceResponse');
var otpconfig = require('../config/otpconfig')
let client = require('twilio')(otpconfig.accountId, otpconfig.authToken)

let usdTotal

module.exports = {
    home: async (req, res, next) => {
        let user = req.session.user
        let cartCount
        let results = {}
        results.products = await productHelper.getAllProducts()

        if (user) {
            cartCount = await userHelper.getCartCount(user._id)
            let cart = await userHelper.getCartProducts(user._id)
            let wishlist = await userHelper.getWishlistProducts(user._id)
            var wallet = await refferalHelper.getWallet(user._id)

            console.log(cartCount)
            let cartId = ''
            if (cartCount) {
                //finding products in cart
                for (i = 0; i < cart.length; i++) {
                    for (j = 0; j < results.products.length; j++) {
                        cartId = cart[i].product._id.toString()
                        productId = results.products[j]._id.toString()
                        if (cartId == productId) {
                            results.products[j].productInCart = true
                        }
                    }
                }
            }


            //finding products in wishlist
            if (wishlist) {
                for (i = 0; i < wishlist.length; i++) {
                    for (j = 0; j < results.products.length; j++) {
                        wishlistId = wishlist[i].product._id.toString()
                        productId = results.products[j]._id.toString()
                        if (wishlistId == productId) {
                            results.products[j].productInWishlist = true
                        }
                    }
                }
            }


            console.log('------------------------result is here ------------------------');
            console.log(results)
            console.log('------------------------result is here------------------------');
            console.log('------------------------result is here------------------------');
            console.log(results)
            console.log('------------------------result is here------------------------');



        }
        let banners = await bannerHelper.getAllBanners()
        let brands = await categoryHelper.getAllBrands()
        await productHelper.getAllProducts().then((products) => {
            console.log('------------------------home products------------------------');
            console.log(results)
            console.log('------------------------home products------------------------');


            res.render('user/home', { results, userHeader: true, user, products, cartCount, banners, brands, wallet })
        })
    },

    getLogin: function (req, res, next) {
        if (req.session.loggedIn) {

            res.redirect('/')
        }
        res.render('user/login', { userBlocked: req.session.userBlocked, loginErr: req.session.loginErr, emailErr: req.session.emailErr })
        req.session.loginErr = false;
        req.session.userBlocked = false;
        req.session.emailErr = false
    },
    postLogin: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            console.log('--------------------------')
            console.log(response)
            console.log('--------------------------')

            if (req.session.loggedIn) {

                res.redirect('/')
            }
            else if (response.userBlocked) {

                req.session.userBlocked = response.userBlocked;
                console.log(req.session.userBlocked);
                res.redirect('/login')

            } else if (response.status) {
                req.session.loggedIn = true;
                req.session.user = response.user;
                res.redirect('/')
            }
            else {
                req.session.loginErr = true
                res.redirect('/login')
            }
        })

    },

    postSignup: (req, res) => {

        console.log(req.body)
        userHelper.doSignup(req.body).then((response) => {
            if (response.userExist) {

                req.session.emailExist = true;
                req.session.emailErr = true
                res.redirect('/login');
            } else {
                // console.log(response)
                res.redirect('/login')
                req.session.emailErr = false

            }

        })
    },
    otpLoginGet: (req, res) => {
        if (req.session.loggedIn) {

            res.redirect('/')
        } else {

            res.render('user/otp', { phoneErr: req.session.phoneError, blockedUser: req.session.userBlocked })
            req.session.phoneError = false
        }

    },
    otpLoginpPost: (req, res) => {
        let phoneId = req.body
        console.log(phoneId)
        userHelper.otpLogin(phoneId).then((response) => {


            if (response.userPhoneFind) {


                if (response.userBlocked) {

                    req.session.userBlocked = true
                    console.log(req.session.userBlocked);
                    res.redirect('/login/otp')
                }
                else {
                    console.log('________________________________')
                    console.log(response.userPhoneFind)
                    req.session.phoneNumber = response.userPhoneFind.phone
                    req.session.user = response.userPhoneFind

                    console.log('________________________________')
                    client.verify.services(otpconfig.serviceId).verifications.create({
                        to: `+91${req.session.phoneNumber}`,
                        channel: 'sms'
                    })

                    res.redirect('/login/otpverify')
                }

            }

            else {
                req.session.phoneError = true
                console.log(req.session.phoneError)
                res.redirect('/login/otp')

            }

        })
    },
    getOtpVerify: (req, res) => {
        if (req.session.loggedIn) {

            res.redirect('/')
        } else {
            res.render('user/otp-verification', { otpErr: req.session.invalidOtp })
            req.session.invalidOtp = false
        }

    },



    postOtpVerify: async (req, res) => {
        let otp = req.body.otp
        console.log(otp)
        let userdetails = await userHelper.getUserByPhoneNumber(req.session.phoneNumber)


        await client.verify.services(otpconfig.serviceId).verificationChecks.create({
            to: `+91${req.session.phoneNumber}`,
            code: otp
        }).then((response) => {

            console.log(response);
            console.log("hellooooooooooooo");
            if (response.valid) {
               
                req.session.loggedIn = true
                req.session.user = userdetails
                res.redirect('/')
            } else {
                req.session.invalidOtp = true
                res.redirect('/login/otpverify')
            }

        })
    },
    quickView: async (req, res) => {
        let user = req.session.user
        let cartCount

        if (user) {
            cartCount = await userHelper.getCartCount(req.session.user._id)
        }


        productHelper.getProductDetails(req.params.id).then((product) => {
            
            res.render('user/quick-view', { product, user, userHeader: true, cartCount })
        })

    },
    category: async (req, res) => {


        await categoryHelper.getBrandProducts(req.params.id).then(async (products) => {
            console.log(products);
            if (req.session.user) {


                let cartCount = await userHelper.getCartCount(req.session.user._id)

                res.render('user/category', { userHeader: true, user: req.session.user, products, cartCount })
            }
            res.render('user/category', { userHeader: true, products })
        })
    },
    shop: async (req, res) => {

        productHelper.getAllProducts().then(async (products) => {
            if (req.session.user) {
                let user = req.session.user
                let cartCount = await userHelper.getCartCount(req.session.user._id)
                res.render('user/shop', { userHeader: true, user, products, cartCount })
            }
            res.render('user/shop', { userHeader: true, products })
        })
    },
    cart: async (req, res) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id)


        if (cartCount != 0) {
            let products = await userHelper.getCartProducts(req.session.user._id)
            let totalValue = await userHelper.getTotalAmount(req.session.user._id)
            let productDetails = await userHelper.productDetails(req.session.user._id)
            // let totalSaved =await userHelper.getTotalSaved(req.session.user._id)
            // let totalRegularPrice= await userHelper.getRegularTotal(req.session.user._id)

            console.log('------------productDetails------------');
            console.log(productDetails);
            console.log('------------productDetails------------');

            res.render('user/cart', { products, user: req.session.user, userHeader: true, cartCount, totalValue, productDetails })
        }
        else {
            res.render('user/cart', { user: req.session.user, userHeader: true, cartCount })
        }
    },
    addToCart: (req, res) => {
        console.log('hii cart is here');
        userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
            res.json({ status: true })
        })
    },
    removeFromCart: (req, res) => {
        console.log(req.params.id);
        userHelper.removeFromCart(req.params.id, req.session.user._id).then((response) => {

            res.redirect('/cart')
        })
    },
    addToWishlist: (req, res) => {
        userHelper.addToWishlist(req.params.id, req.session.user._id).then((response) => {
            res.json({ status: true })
        })
    },
    wishlist: async (req, res) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id)

        let wishlistCount = await userHelper.getWishlistCount(req.session.user._id)
        console.log(wishlistCount);
        if (wishlistCount != 0) {
            let products = await userHelper.getWishlistProducts(req.session.user._id)
            res.render('user/wishlist', { products, user: req.session.user, userHeader: true, wishlistCount, cartCount })

        } else {
            res.render('user/wishlist', { user: req.session.user, userHeader: true, wishlistCount, cartCount })
        }

    },
    removeFromWishlist: (req, res) => {
        console.log(req.params.id);
        userHelper.removeFromWishlist(req.params.id, req.session.user._id).then((response) => {
            res.redirect('/wishlist')
        })
    },
    moveToCart: (req, res) => {
        console.log('pro id' + req.params.id);
        userHelper.moveToCart(req.params.id, req.session.user._id).then((response) => {
            userHelper.removeFromWishlist(req.params.id, req.session.user._id).then((response) => {
                res.json({ status: true })
            })
        })

    },
    changeProductQuantity: (req, res) => {
        userHelper.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelper.getTotalAmount(req.body.user)
            response.quantityTotal = await userHelper.totalByQuantity(req.body.user)

            res.json(response)
        })
    },
    checkout: async (req, res) => {
        user = req.session.user
        let products = await userHelper.getCartProducts(user._id)
        let productDetails = await userHelper.productDetails(user._id)
        let totalValue = await userHelper.getTotalAmount(req.session.user._id)
        cartCount = await userHelper.getCartCount(req.session.user._id)
        subTotal = totalValue[0].total
        grandTotal = totalValue[0].total
        let cart = await userHelper.couponChek(user._id)
        let coupon = await userHelper.findCoupon(cart.couponcode)
        if (cart.couponcode) {
            let discount = Math.round(grandTotal / 100 * parseInt(coupon.coupondiscount))
            grandTotal = grandTotal - discount
        }
        discountedPrice = subTotal - grandTotal
        couponcode = cart.couponcode

        let address = await addressHelper.getAllAddress(user._id)
        let wallet = await refferalHelper.getWallet(user._id)
        if (grandTotal < wallet.balance) {
            var shopWithBalance = true
        } else {
            var shopWithBalance = false
        }
        if (products) {
            res.render('user/checkout', { user, userHeader: true, subTotal, grandTotal, discountedPrice, couponcode, productDetails, cartCount, address, wallet, shopWithBalance })
        }
        else {

            res.redirect('/cart')
        }
    },
    placeOrder: async (req, res) => {
        let products = await userHelper.getCartProductList(req.session.user._id)
        let totalValue = await userHelper.getTotalAmount(req.session.user._id)
        console.log(req.body);
        console.log(products);
        console.log(totalValue[0].total);
        let grandTotal = totalValue[0].total
        let cart = await userHelper.couponChek(req.session.user._id)
        let coupon = await userHelper.findCoupon(cart.couponcode)
        if (cart.couponcode) {
            let discount = Math.round(grandTotal / 100 * parseInt(coupon.coupondiscount))
            grandTotal = parseInt(grandTotal - discount)
        }


        console.log(grandTotal);


        userHelper.placeOrder(req.body, products, grandTotal, req.session.user._id).then(async (orderId) => {
            console.log(orderId);
            if (req.body['payment-method'] === 'COD') {
                res.json({ codSuccess: true })
            } else if (req.body['payment-method'] == 'Razorpay') {
                userHelper.generateRazorpay(orderId, grandTotal).then((response) => {
                    console.log('-----response is here---------');
                    console.log(response)
                    res.json({ razorpaySuccess: true, response })
                })
            } else if (req.body['payment-method'] == 'PayPal') {

                await currencyConverter.from("INR").to("USD").amount(grandTotal).convert().then(async (response) => {
                    await userHelper.generatePaypal(orderId, response).then((link) => {

                        console.log("*****((((");
                        console.log(link);
                        res.json(link)
                    })
                })

            } else if (req.body['payment-method'] === 'wallet') {
                userHelper.shopWithWallet(grandTotal, req.session.user._id).then((response) => {
                    console.log('-----response is here---------');
                    console.log(response)
                    res.json({ walletpaySuccess: true, response })
                })
            }

        })
        console.log(req.body);
    },
    confirmOrder: async (req, res) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id)

        res.render('user/order-successfull', { userHeader: true, user: req.session.user, cartCount })
    },
    addAddress: (req, res) => {

        addressHelper.addAddress(req.body, req.session.user._id).then((data) => {
            console.log(data)
            // console.log(response)
            res.redirect('/checkout')
        })
    },
    orders: async (req, res) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id)
        let orderDetails = await userHelper.getOrderList(req.session.user._id)
        let orders = orderDetails.orders
        console.log(orderDetails.orders)
        let pages = orderDetails.pages
        console.log(pages);
        res.render('user/orders', { user: req.session.user, cartCount, userHeader: true, orders, pages })

    },
    postOrder: (req, res) => {
        console.log(req.body)
        userHelper.pagination(req.body.pages, req.session.user._id).then((data) => {
            console.log(data);
            res.render('user/moreorders', { data })

        })
    },
    orderedProducts: async (req, res) => {
        let products = await userHelper.getOrderedProducts(req.params.id)
        let total = await userHelper.totalProductsValue(req.params.id)

        let address = await userHelper.shippingAddress(req.params.id)
        cartCount = await userHelper.getCartCount(req.session.user._id)


        console.log('----order details are herr -------')
        console.log(total)
        console.log(address);
        console.log('----order details are herr -------')
        res.render('user/view-orders', { user: req.session.user, userHeader: true, products, total, address, cartCount })
    },
    product: async (req, res) => {
        let id = req.params.id
        let product = await productHelper.getProductDetails(id)
        res.render('user/product', { userHeader: true, product })
    },
    verifyAmount: (req, res) => {
        console.log(req.body)

        userHelper.verifyPayment(req.body).then(() => {

            userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log("payment successfull")
                res.json({ status: true })
            }).catch((err) => {
                console.log(err);

            })
        }).catch((err) => {
            console.log(err);
            res.json({ status: false, errMsg: '' })
        })
    },
    success: (req, res) => {

        console.log('--------req query-------');
        console.log(req.query)
        console.log('--------req query-------');
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "25.00"
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                console.log(req.body);
                console.log("8888");



                res.redirect('/confirm-order');


            }
        });
    },
    postCoupon: (req, res) => {
        console.log(req.body.couponcode);
        let user = req.session.user
        productHelper.findCoupon(req.body.couponcode, user).then(async (response) => {
            console.log(("$$$$$"));
            console.log(response)
            console.log(("$$$$$"));
            if (response.a) {


                let totalPrice = await userHelper.getTotalAmount(user._id)

                console.log(totalPrice);

                let discount = totalPrice[0].total * parseInt(response.a) / 100


                let amount = totalPrice[0].total - discount
                console.log(amount)
                console.log(("$$$$$"));
                console.log(totalPrice[0].total)
                console.log(totalPrice[0].total - amount)

                response.discountedprice = totalPrice[0].total - amount
                response.finalAmount = amount

                console.log(response);
                res.json(response)

            } else {
                res.json(response)
            }
        })
    },
    cancelItem: (req, res) => {
        let orderId = req.params.id
        let user = req.session.user._id
        userHelper.cancelOrder(orderId, user).then((cancelled) => {
            console.log(("$$$$$"));
            console.log(("$$$$$"));
            console.log(cancelled)
            console.log(("$$$$$"));
            console.log(("$$$$$"));
            productHelper.incProduct(cancelled[0].item, cancelled[0].quantity)
            userHelper.refundToWallet(orderId, user)
            res.redirect('/orders')
        })
    },
    returnOrder: (req, res) => {
        console.log(req.body);
        userHelper.returnOrder(req.body).then((response) => {
            res.json({ status: true })
        })
    },
    myAccount: async (req, res) => {
        let user = req.session.user
        let address = await addressHelper.getAllAddress(user._id)
        let wallet = await refferalHelper.getWallet(user._id)
        cartCount = await userHelper.getCartCount(req.session.user._id)

        res.render('user/myaccount', { userHeader: true, address, user, wallet, cartCount })
    },
    changeDetails: (req, res) => {
        let userId = req.params.id
        console.log('-------------------------------');
        console.log(req.body);
        console.log('-------------------------------');
        userHelper.updateUser(userId, req.body).then((response) => {
            console.log('-------------------------------');
            console.log(response);
            console.log('-------------------------------');
            req.session.user = response

            res.redirect('/myaccount')
        })

    },
    changePassword: (req, res) => {
        console.log('change password');
        let userId = req.params.id
        userHelper.changePassword(userId, req.body).then(() => {
            res.redirect('/logout')
        })
    },
    search: async (req, res) => {
        console.log('call is here');
        let payload = req.body.payload.trim()
        console.log(payload)
        let search = await userHelper.searchProducts(payload)
        console.log(search);
        res.send({ payload: search })
    },
    logout: (req, res) => {
        req.session.loggedIn = ''
        req.session.user = ''
        res.redirect('/')
    }

}
