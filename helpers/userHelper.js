var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { response } = require('express')
const bcrypt = require('bcrypt')
const { Db } = require('mongodb')
const Razorpay = require('razorpay')
const { log } = require('console')
var paypal = require('paypal-rest-sdk');
const CC = require('currency-converter-lt')
const { type } = require('os')
const { resolve } = require('path')
var code = require('voucher-code-generator');
const refferalHelper = require('../helpers/referralHelper')

let currencyConverter = new CC()
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQikqlyld8L5iXjmi5hGQSB8GdA3IjealDynhGYDrSUeJxWYVCUwQ_dNjd4_zJHDBwKkXZtKHxXbN1dG',
    'client_secret': 'EJIZL6c-OE6eh9Klw4rOcRT763UolwjLSeM8X2ON1dhmr-ZDzUn9DQlzmBo7F2qNP4XmmW4GOGfp5sng'
});
var instance = new Razorpay({
    key_id: 'rzp_test_nKQWJAxWQhoKbk',
    key_secret: 'iVvd9iZk7Z56VEeo7c7gaaKR'
})
module.exports = {

    getAllusers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            // console.log('-----------------------------------------------------------------')
            // console.log(users)
            resolve(users)
        })
    },
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            console.log('-----------******************--------------------');
            console.log(userData)
            console.log('------------******************-------------------');
            let userEmailFind = await db.get().collection(collection.USER_COLLECTION).count({ email: userData.email })
                // .findOne({ $or: [{ email: userData.email }, { phone: userData.phone }] })
                console.log('-------------------------------');
                console.log(userEmailFind);
                console.log('-------------------------------');


            if (userEmailFind!=0) {
                response.userExist = true
                response.emailError = true
                resolve(response)
            }
            else {
                console.log("*******");
                console.log('else working');
                console.log("*******");

                if (userData.refferal) {
                    console.log("*******");
                    console.log('else working');
                    console.log("*******");
                    refferal = await db.get().collection(collection.USER_COLLECTION).findOne({ refferals: userData.refferal })
                    console.log("*******");
                    console.log(refferal);
                    console.log(userData);
                    if (refferal) {
          
                    let amount=parseInt(100)
                    refferalHelper.refferalAmount(refferal,amount)
                    
                      refferal = code.generate({
                        length: 5,
                        count: 4,
                        charset: code.charset("alphabetic")
                      });
              
                      userData.Password = await bcrypt.hash(userData.Password, 10)
                      var date = new Date();
              
                      var month = date.getUTCMonth() + 1; //months from 1-12
                      var day = date.getUTCDate();
                      var year = date.getUTCFullYear();
                      
          
                      userData.newdate = year + "/" + month + "/" + day;
                      userData.refferals = refferal[0]
          
          
                      db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((hash) => {
                      refferalHelper.addWallet(hash.insertedId)
                      refferalHelper.addAmount(hash.insertedId)
                      resolve(hash)
                      console.log(hash);
                       
              
                      })
                     
                    }
                    else {
                      response.message = "refferal errror"
          
                      resolve(response)
                    }
                  }else{
                    refferal = code.generate({
                      length: 5,
                      count: 4,
                      charset: code.charset("alphabetic")
                    });
            
                    userData.Password = await bcrypt.hash(userData.Password, 10)
                    var date = new Date();
            
                    var month = date.getUTCMonth() + 1; //months from 1-12
                    var day = date.getUTCDate();
                    var year = date.getUTCFullYear();
                    userData.newdate = year + "/" + month + "/" + day;
                    userData.refferals = refferal[0]
          
                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((hash) => {
                    refferalHelper.addWallet(hash.insertedId)
                    resolve(hash)
                    // console.log(hash);
                     
            
                    })
                  }
                  response.message = ""
          
          
                }  

                })
            },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                if (!user.isBlocked) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {
                            console.log('Login Success');
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log('Login Failed')
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log('Login Failed')
                    console.log('you are blocked')
                    response.userBlocked = true
                    resolve(response)
                }
            } else {
                console.log('Login Failed')
                resolve({ status: false })
            }
        })
    },
    updateUser:(userId,userData)=>{
        return new Promise(async(resolve, reject) =>{
            let response ={}
            console.log('-------------------------------');
            console.log(userId);
            console.log('-------------------------------');
            let userEmailFind = await db.get().collection(collection.USER_COLLECTION).findOne({$and:[{email:userData.email},{_id:{$ne:objectId(userId)}}]})
            // .findOne({ $or: [{ email: userData.email }, { phone: userData.phone }] })
            console.log('-------------------------------');
            console.log(userEmailFind);
            console.log('-------------------------------');


        if (userEmailFind) {
            response.userExist = true
            response.emailError = true
            resolve(response)
        }else{
            console.log('else working');
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId)},
            {
                $set:{
                    name:userData.name,
                    email:userData.email,
                    phone:userData.phone
                }
            }).then(async() => {
              let user=await  db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId)})
            console.log('-------------------------------');
            console.log(user);
            console.log('-------------------------------');

            resolve(user);
              
                
            })
        }
            
        })
    },
    changePassword: (userId,userData)=>{
        return new Promise(async (resolve, reject) => {
         let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })

         bcrypt.compare(userData.Password, user.Password).then(async(status) => {
            if (status) {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                
                {
                    $set:{
                        Password:userData.password

                    }
                })
                
                resolve(response)
            } else {
                
                resolve()
            }
        })

        })
    },

    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                .then((user) => {
                    resolve(user);
                })
        })
    },


    otpLogin: (phoneId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            // console.log(userData)
            let userPhoneFind = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ phone: phoneId.phone })
            console.log('######--------------------------#######')
            console.log(userPhoneFind)
            console.log('#####--------------------------######')

            if (userPhoneFind) {
                if (userPhoneFind.isBlocked) {

                    response.userBlocked = true
                    response.userPhoneFind = true
                    console.log(response.userBlocked);
                    resolve(response)
                } else {
                    response.userPhoneFind = userPhoneFind
                    console.log(userPhoneFind)
                    resolve(response)
                }

            }
            else {

                response.PhoneError = true
                resolve(response)

            }

        })


    },
    getUserByPhoneNumber: (mobnumber) => {
        return new Promise(async (resolve, reject) => {
            userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: mobnumber })
            resolve(userDetails)
        })
    },
    addToCart: (productId, userId) => {
        console.log(productId, userId);
        let productObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {

                let productExist = userCart.products.findIndex(products => products.item == productId)
                console.log(productExist);
                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: productObj }

                            }
                        ).then((response) => {
                            console.log(response)
                            resolve()
                        })
                }

            } else {

                let cartObj = {

                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    console.log(response);
                    resolve()
                })
            }
        })
    },
    moveToCart: (productId, userId) => {
        console.log(productId, userId);
        let productObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {

                let productExist = userCart.products.findIndex(products => products.item == productId)
                console.log(productExist);
                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: productObj }

                            }
                        ).then((response) => {
                            console.log(response)
                            resolve()
                        })
                }

            } else {

                let cartObj = {

                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    console.log(response);
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).find({ user: objectId(userId) }).toArray()
            console.log('cart is here___________________');
            console.log(cart);
            console.log('cart is here___________________');
            if (cart[0]) {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    }
                    ,
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup:
                        {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }

                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $addFields: {
                            totalQuantityPrice: {
                                $multiply: ['$quantity', { $toInt: '$product.price' }]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: collection.BRAND_COLLECTION,
                            localField: 'product.brand',
                            foreignField: '_id',
                            as: 'brandName'

                        }
                    },
                    {
                        $project: {
                            product: 1,


                            stock: 1,
                            price: 1,
                            quantity: 1,
                            totalQuantityPrice: 1,
                            productOffer: 1,
                            img: 1,
                            brand: 1,
                            biggerDiscount:
                            {
                                $cond:
                                {
                                    if:
                                    {
                                        $gt: [
                                            { $toInt: '$product.productOffer' },
                                            { $toInt: '$brand.brandOffer' }
                                        ]
                                    }, then: '$product.productOffer', else: '$brand.brandOffer'
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            discountedAmount:
                            {
                                $round:
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                { $toInt: '$product.price' },
                                                { $toInt: "$biggerDiscount" }
                                            ]
                                        }, 100]
                                }
                            },
                        }
                    },
                    {
                        $addFields: {
                            finalPrice:
                            {
                                $round:
                                {
                                    $subtract: [
                                        { $toInt: '$product.price' },
                                        { $toInt: "$discountedAmount" }]
                                }
                            }
                        }
                    }, {
                        $addFields: {
                            totalAfterDiscount: {
                                $multiply: ['$quantity', '$finalPrice'],
                            },
                        },
                    }

                ]).toArray();
                console.log('--------------------------------wanted-----------------------------');
                console.log(cartItems);
                console.log('-------------------------------wanted--------------------------------');

                resolve(cartItems);
            }
            else {
                resolve()
            }


        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        console.log(details.quantity)
        return new Promise(async(resolve,reject)=>{
            if(count ==-1 && details.quantity == 1){
                await db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{

                    resolve({removeProduct:true})
                })
            }else{

                if(count != -1){
                    let productCheck = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(details.product)})
                   console.log('-----------checking-------');
                    console.log(productCheck)
                   console.log('-----------completed-------');

                if(parseInt(productCheck.stock) > parseInt(details.quantity)){

                 await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        
                        resolve({status:true})
                    }).catch((err)=>{
                        reject(err)
                    })
                }else{
                    resolve({quantityFalse:true})
                }


                }else{

                    await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        
                        resolve({status:true})
                    }).catch((err)=>{
                        reject(err)
                    })
                }

                
            } 
        
        })
    

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        totalQuantityPrice: {
                            $multiply: ['$quantity', { $toInt: '$product.price' }]
                        }
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {
                        product: 1,


                        stock: 1,
                        price: 1,
                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,
                        img: 1,
                        brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$product.productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$product.productOffer', else: '$brand.brandOffer'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        discountedAmount:
                        {
                            $round:
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            { $toInt: '$product.price' },
                                            { $toInt: "$biggerDiscount" }
                                        ]
                                    }, 100]
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        finalPrice:
                        {
                            $round:
                            {
                                $subtract: [
                                    { $toInt: '$product.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }, {
                    $addFields: {
                        totalAfterDiscount: {
                            $multiply: ['$quantity', '$finalPrice'],
                        },
                    },
                },
                {
                    $addFields: {
                        totalAmount: {
                            $cond: {
                                if: '$totalAfterDiscount',
                                then: '$totalAfterDiscount',
                                else: '$totalQuantityPrice',
                            },
                        },
                    },
                },

                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$totalAmount',
                        },
                    },
                },
                
            ]).toArray();
            console.log('---------------------------------------------------------------');
            console.log(total);
            console.log('---------------------------------------------------------------');


            resolve(total);

        })

    },
    getTotalSaved: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        totalQuantityPrice: {
                            $multiply: ['$quantity', { $toInt: '$product.price' }]
                        }
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {
                        product: 1,


                        stock: 1,
                        price: 1,
                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,
                        img: 1,
                        brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$product.productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$product.productOffer', else: '$brand.brandOffer'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        discountedAmount:
                        {
                            $round:
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            { $toInt: '$product.price' },
                                            { $toInt: "$biggerDiscount" }
                                        ]
                                    }, 100]
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        finalPrice:
                        {
                            $round:
                            {
                                $subtract: [
                                    { $toInt: '$product.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }, {
                    $addFields: {
                        totalAfterDiscount: {
                            $multiply: ['$quantity', '$finalPrice'],
                        },
                    },
                },
                // {
                //     $addFields: {
                //         totalAmount: {
                //             $cond: {
                //                 if: '$totalAfterDiscount',
                //                 then: '$totalAfterDiscount',
                //                 else: '$totalQuantityPrice',
                //             },
                //         },
                //     },
                // },

                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$discountedAmount',
                        },
                    },
                },
                
            ]).toArray();
            console.log('---------------------------------------------------------------');
            console.log(total);
            console.log('---------------------------------------------------------------');


            resolve(total);

        })

    },
    getRegularTotal: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {

                    $project: {
                        item: 1, quantity: 1, product:1,
                        totalQuantityPrice: {$multiply: ['$quantity', { $toInt: '$product.price' }]}
                            
                    }
                   
                    
                },

                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$totalQuantityPrice',
                        },
                    },
                },
                
            ]).toArray();
            console.log('---------------------------------------------------------------');
            console.log(total);
            console.log('---------------------------------------------------------------');


            resolve(total);

        })

    },

    totalByQuantity: (userId) => {
        return new Promise(async (resolve, reject) => {

            let quantityTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        quantityTotal: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {
                        product: 1,

                        quantityTotal: 1,


                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,

                        brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$product.productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$product.productOffer', else: '$brand.brandOffer'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        discountedAmount:
                        {
                            $round:
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            { $toInt: '$product.price' },
                                            { $toInt: "$biggerDiscount" }
                                        ]
                                    }, 100]
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        finalPrice:
                        {
                            $round:
                            {
                                $subtract: [
                                    { $toInt: '$product.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }, {
                    $addFields: {
                        QuantityTotalAfterDiscount: {
                            $multiply: ['$quantity', '$finalPrice'],
                        }
                    }
                }
            ]).toArray();
            console.log('--------------------quantity total-------------------------------------------');
            console.log(quantityTotal);
            console.log('---------------------quantity total------------------------------------------');


            resolve(quantityTotal);

        })

    },
    productDetails: (userId) => {
        return new Promise(async (resolve, reject) => {

            let quantityTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: 1,
                       
                    }
                },
                {
                    $addFields: {
                        quantityTotal: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {

                        product: 1,

                        quantityTotal:1,
                        stock: 1,
                        price: 1,
                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,
                       
                       
                        brand: { $arrayElemAt: ['$brandName', 0] },
                    }
                },
                {
                    $project: {
                        product: 1,

                        quantityTotal:1,
                        stock: 1,
                        price: 1,
                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,
                        img: 1,
                        brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$product.productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$product.productOffer', else: '$brand.brandOffer'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        discountedAmount:
                        {
                            $round:
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            { $toInt: '$product.price' },
                                            { $toInt: "$biggerDiscount" }
                                        ]
                                    }, 100]
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        finalPrice:
                        {
                            $round:
                            {
                                $subtract: [
                                    { $toInt: '$product.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }, {
                    $addFields: {
                        quantityTotalAfterDiscount: {
                            $multiply: ['$quantity', '$finalPrice'],
                        },
                    }
                }
            ]).toArray();
            console.log('---------------------------------------------------------------');
            console.log(quantityTotal);
            console.log('---------------------------------------------------------------');


            resolve(quantityTotal);


        })

    },
    placeOrder: (order, products, total, userId) => {

        console.log(total);
        var today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate())
        return new Promise(async (resolve, reject) => {
            let status = order['payment-method'] === 'COD' || 'wallet' ? 'Placed' : 'Pending'
            let orderObj = {
                addressId: objectId(order.addressId),
                userId: objectId(userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: date

            }
            let orderedProducts = products
            let quantity = orderedProducts[0].quantity
            let item = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(orderedProducts[0].item) })
            let stock = item.stock
            let updatedStockCount = parseInt(stock) - parseInt(quantity)
            if (parseInt(stock) == 0) {
                updatedStockCount = undefined
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log(response);
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(orderedProducts[0].item) },
                    {
                        $set: {
                            stock: updatedStockCount
                        }
                    })
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) }).then((response) => {
                    console.log(response);
                })
                console.log('response is here----------------------------');
                console.log(response);
                console.log('response is here----------------------------');

                resolve(response.insertedId)
            })

        })

    },

    getCartProductList: (userId) => {
        console.log(userId);

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            console.log(cart)
            resolve(cart.products)
        })
    },
    getAllOrders: () => {

        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: "userId",
                        foreignField: "_id",
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                }

            ]).toArray()
            // console.log('-----------------------------------------------------------------')
            console.log(orders)
            resolve(orders)
        })
    },
    getOrderList: (user) => {
        let response = {}
        console.log(user);
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(user) }).toArray()
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(user) }).limit(5).toArray()
            let pages = Math.ceil((orderItems.length / 5))
            response.pages = pages
            response.orders = orders


            // console.log(orderItems)
            resolve(response)
        })
    },
    getOrderedProducts: (orderId) => {
        console.log(orderId)
        return new Promise(async (resolve, reject) => {
            let orderedItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                }
                ,

                {
                    $unwind: '$products'
                },
                {
                    $project: {

                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        quantityTotal: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {
                        product: 1,

                        quantityTotal: 1,


                        quantity: 1,
                        totalQuantityPrice: 1,
                        productOffer: 1,

                        brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$product.productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$product.productOffer', else: '$brand.brandOffer'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        discountedAmount:
                        {
                            $round:
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            { $toInt: '$product.price' },
                                            { $toInt: "$biggerDiscount" }
                                        ]
                                    }, 100]
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        finalPrice:
                        {
                            $round:
                            {
                                $subtract: [
                                    { $toInt: '$product.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }, {
                    $addFields: {
                        QuantityTotalAfterDiscount: {
                            $multiply: ['$quantity', '$finalPrice'],
                        }
                    }
                }

            ]).toArray();
            console.log('----*************************---------------------------*********************--------------------------------');
            console.log(orderedItems);
            console.log('----------************************-------------------------********************----------------------------');

            resolve(orderedItems);

        })
    },
    totalProductsValue: (orderId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                }
                ,

                {
                    $project: {
                        totalAmount: '$totalAmount', date: 1

                    }
                },



            ]).toArray();
            console.log('---------------------------------------------------------------');
            console.log(total);
            console.log('---------------------------------------------------------------');


            resolve(total);

        })

    },
    shippingAddress: (orderId) => {
        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                }
                , {
                    $lookup:
                    {
                        from: collection.ADDRESS_COLLECTION,
                        localField: 'addressId',
                        foreignField: '_id',
                        as: 'addressDetails'
                    }
                },

                {
                    $project: {
                        addressDetails: { $arrayElemAt: ['$addressDetails', 0] },
                        paymentMethod: 1,
                        status: 1

                    }
                }


            ]).toArray();
            console.log('-----------address ----details -----are -------------here---------------------');
            console.log(address[0]);
            console.log('------------------address ----details -----are -------------here---------------------');


            resolve(address[0]);

        })

    },
    generateRazorpay: (orderId, total) => {

        console.log(total);
        return new Promise(async (resolve, reject) => {

            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            }

            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('New order:', order);
                    resolve(order);
                }

            })

        })
    },
    generatePaypal: (orderId, total) => {

        typeof (total)
        console.log(typeof total)
        total = Math.ceil(total)
        console.log('call is coming inside ')
        console.log(total)
        console.log('============')
        console.log('call is coming in paypal')

        return new Promise(async (resolve, reject) => {

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/confirm-order",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]
            }

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    console.log('---------error----------------')

                    console.log(error)
                    console.log('---------error----------------')
                    throw error

                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            resolve(payment.links[i].href)
                            db.get().collection(collection.ORDER_COLLECTION)
                                .updateOne({ _id: objectId(orderId) },
                                    {
                                        $set: {
                                            status: 'placed'
                                        }
                                    }
                                )



                        }
                    }
                }
            });
        })


    },
    removeFromCart: (productId, userId) => {
        console.log(productId)
        console.log('-i am here for removing------------------');
        return new Promise(async (resolve, reject) => {
            console.log('-i am here for removing you frnd------------------');
            await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                {

                    $pull: { products: { item: objectId(productId) } }

                }

            ).then((response) => {
                console.log(response);
                resolve(response)

            })

        })

    },
    addToWishlist: (productId, userId) => {
        console.log(productId, userId);


        let productObj = {
            item: objectId(productId),

        }


        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {

                let productExist = userWishlist.products.findIndex(products => products.item == productId)
                console.log(productExist);
                if (productExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {

                            $pull: { products: { item: objectId(productId) } }

                        }

                    ).then((response) => {
                        console.log(response);
                        resolve()
                    })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: productObj }

                            }
                        ).then((response) => {
                            console.log(response)
                            resolve()
                        })
                }

            } else {



                let wishlistObj = {

                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {

                    console.log(response);
                    resolve()
                })
            }
        })


    },
    getWishlistProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).find({ user: objectId(userId) }).toArray()
            console.log('cart is here___________________');
            console.log(wishlist);
            console.log('cart is here___________________');
            if (wishlist[0]) {
                let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    }
                    ,
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item'

                        }
                    },
                    {
                        $lookup:
                        {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        },

                    },
                    {
                        $project: {
                            item: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                ]).toArray();
                console.log('---------------------------------------------------------------');
                // console.log(cartItems[0].products);
                console.log('---------------------------------------------------------------');

                resolve(wishlistItems);
            }
            else {
                resolve()
            }


        })
    },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let count = 0
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            console.log('-------------wishlist---------------------------');
            console.log(wishlist)
            console.log('-------------wishlist---------------------------');

            if (wishlist) {
                count = wishlist.products.length
            }
            resolve(count)
        })
    },
    removeFromWishlist: (productId, userId) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                {

                    $pull: { products: { item: objectId(productId) } }

                }

            ).then((response) => {
                console.log(response);
                resolve(response)

            })

        })

    },
    verifyPayment: (details) => {
        console.log(details);
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'iVvd9iZk7Z56VEeo7c7gaaKR')

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    }
    ,
    changePaymentStatus: (orderId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then((hai) => {
                    console.log(hai);
                    resolve()
                }).catch((err) => {
                    console.log(err);
                })
        })
    },
    changeOrderStatus: (orderStatus) => {
        return new Promise(async (resolve, reject) => {
            let status = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderStatus.orderId) },
                {
                    $set: {
                        status: orderStatus.status
                    }
                }
            )
            resolve(status)
        })
    },
    couponChek: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart)
        })
    },
    findCoupon: (coupon) => {
        return new Promise(async (resolve, reject) => {
            let couponDetails = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponcode: coupon })
            resolve(couponDetails)
        })
    },
    pagination: (pages, userId) => {
        console.log(userId);
        console.log(pages);
        pages = parseInt(pages)
        console.log(pages);
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).limit(5).skip((pages - 1) * 5).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    cancelOrder: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.ORDER_COLLECTION).update({ _id: objectId(orderId) },
                {
                    $set: { status: 'order-cancelled' }
                }).then(() => {
                    let productCancelled = db.get().collection(collection.ORDER_COLLECTION).aggregate([

                        {
                            $match: { _id: objectId(orderId) }
                        },


                        {

                            $unwind: '$products'
                        },

                        {
                            $project: {
                                item: '$products.item', quantity: '$products.quantity',
                                paymentMethod: 1, status: 1, date: 1
                            }

                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
                                paymentMethod: 1, status: 1, date: 1
                            }
                        },


                    ]).toArray()
                    resolve(productCancelled)
                })



        })
    },
    changeOrderStatus: (orderStatus) => {
        return new Promise(async (resolve, reject) => {
            let status = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderStatus.orderId) }, {
                $set: {
                    status: orderStatus.status
                }
            })
            console.log(status);
            resolve(status)
        })
    },
    returnOrder: (returnedOrder) => {
        console.log(returnedOrder)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(returnedOrder.orderId) }, {
                $set: {
                    status: 'Return requested',
                    returnReason: returnedOrder.reason
                }

            })
            resolve()   
        })
    },
    approveReturn: (orderId) => {
        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'Return Approved '
                }
            })
        let order=  await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId)})

            resolve(order)
        })
    },
    refundToWallet:(orderId,userId) => {
        let refundData={}
        return new Promise(async (resolve, reject) => {
        let order=  await  db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
        console.log('----cancelled order----------------');
        console.log(order)
        console.log('----cancelled order----------------');
        refundData={
            amount:order.totalAmount,
            date:new Date().toDateString(),
            Timestamp:new Date(),
            status:"credited",
            message:"Refund Amount"
        }


        db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:objectId(userId)}, {
            $inc:{
                balance:order.totalAmount
            },
            $push:{
                Transactions:refundData
            }
        })
        resolve()
        })
    },
    shopWithWallet:(total,userId) => {
        let walletData={}
        walletData={
            amount:total,
            date:new Date().toDateString(),
            Timestamp:new Date(),
            status:"Debited",
            message:"Shop with Wallet"
        }
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:objectId(userId)}, 
            {
                $inc:{
                    balance:-total
                },
                 $push:{
                    Transactions:walletData
                }
            }
            ).then((response) => {
                resolve(response)
            })
        })
    },
    searchProducts:(payload)=>{
      return new Promise(async(resolve, reject) => {
        let  search = await db.get().collection(collection.PRODUCT_COLLECTION).find({ productName: { $regex: new RegExp('^' + payload + '.*', 'i') } }).toArray()
           search = search.slice(0, 10)
           console.log(search)
           resolve(search)
      })

    }
    }


