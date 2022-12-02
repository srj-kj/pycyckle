var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { response } = require('express')
const { ObjectId } = require('mongodb')
module.exports = {
    addProduct: (productData) => {
        let response = {}
        productData.category = objectId(productData.category)
        productData.brand = objectId(productData.brand)
        return new Promise((resolve, reject) => {
            // console.log(userData)
            console.log(productData)
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {

                resolve(data.insertedId)
                console.log('data is here ----------------------------------------');
                console.log(data);
            })

        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: 'category',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryName'

                    }  
                },
                {
                    $lookup: {
                        from: 'brand',
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {

                        productName: 1,
                        productDescription: 1,
                        // Des:1,

                        stock: 1,
                        // PriceOg:1,
                        price: 1,
                        // color:1,

                        productOffer: 1,
                        img: 1,
                        category: { $arrayElemAt: ['$categoryName', 0] },
                        brand: { $arrayElemAt: ['$brandName', 0] },
                    }
                },
                {
                    $project: {
                        productName: 1,
                        productDescription: 1,
                        // Des:1,
                        // Qty:1,
                        stock: 1,
                        price: 1,
                        // color:1,

                        productOffer: 1,
                        img: 1,
                        category: 1, brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$productOffer', else: '$brand.brandOffer'
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
                                            { $toInt: '$price' },
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
                                    { $toInt: '$price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }

            ]).toArray()

            console.log(products);
            resolve(products);
        })

    },


    deleteProducts: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails: (productId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(productId) }
                },
                {

                    $lookup: {
                        from: 'category',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryName'

                    }
                },
                {
                    $lookup: {
                        from: 'brand',
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brandName'

                    }
                },
                {
                    $project: {

                        productName: 1,
                        productDescription: 1,
                        // Des:1,

                        stock: 1,
                        // PriceOg:1,
                        price: 1,
                        // color:1,

                        productOffer: 1,
                        img: 1,
                        category: { $arrayElemAt: ['$categoryName', 0] },
                        brand: { $arrayElemAt: ['$brandName', 0] },
                    }
                },
                {
                    $project: {
                        productName: 1,
                        productDescription: 1,
                        // Des:1,
                        // Qty:1,
                        stock: 1,
                        price: 1,
                        // color:1,

                        productOffer: 1,
                        img: 1,
                        category: 1, brand: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$productOffer' },
                                        { $toInt: '$brand.brandOffer' }
                                    ]
                                }, then: '$productOffer', else: '$brand.brandOffer'
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
                                            { $toInt: '$price' },
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
                                    { $toInt: '$price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }
            ]).toArray()

            // let categories = await db.get().collection('category').find().toArray();
            // let brands = await db.get().collection('brand').find().toArray();
            // let response ={
            //     product : product[0] ,
            //     categories : categories,
            //     brands : brands
            // }
            console.log('---------response is here -----------------');
            console.log(product);
            console.log('---------response is here -----------------');
            resolve(product);
        })
    },

    updateProduct: (productId, productData) => {
        productData.category = objectId(productData.category)
        productData.brand = objectId(productData.brand)
        console.log(productId);
        console.log(productData);
        console.log("its working");
        return new Promise(async (resolve, reject) => {
            let img = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) })

            if (productData.img.length == 0) {
                productData.img = img.img
            }

            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(productId) }, {
                    $set: {
                        productName: productData.productName,
                        productDescription: productData.productDescription,
                        brand: productData.brand,
                        price: productData.price,
                        category: productData.category,
                        img: productData.img
                    }
                }).then((response) => {
                    console.log("hellooooooooooooo i am updated nowwww ")
                    resolve();
                })


        })

    },
    quickViewProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) })
            resolve(product)
        })

    },
    addCoupon: (couponDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((coupon) => {
                resolve(coupon)
            })
        })
    },
    getAllCoupons: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((coupons) => {
                resolve(coupons)
            })
        })
    },
    findCoupon: (coupon, user) => {
        console.log(coupon);
        return new Promise(async (resolve, reject) => {
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponcode: coupon })
            console.log(couponExist);
            let response = {};
            if (couponExist) {
                let userCheck = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponcode: coupon, user: { $in: [objectId(user._id)] } })
                if (userCheck) {
                    response.used = true;
                    resolve(response)
                } else {
                    date = new Date()
                    expdate = new Date(couponExist.expdate)

                    if (date <= expdate) {
                        console.log("%%%%%%%%%")
                        db.get().collection(collection.COUPON_COLLECTION).updateOne({ couponcode: coupon },
                            {

                                $push: { user: objectId(user._id) }

                            }).then((response) => {
                                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(user._id) },
                                    {
                                        $set: { couponcode: coupon }
                                    })
                                response.a = couponExist.coupondiscount
                                response.coupon = couponExist.couponcode
                                console.log('coupon used');
                                console.log(response);
                                resolve(response)
                            })
                    } else {

                        response.dateErr = true
                        resolve(response)
                    }
                }
            } else {
                console.log('Invalid coupon')
                response.invalid = true
                resolve(response)
            }
        })
    },
    setProductOffer: (percent) => {
        console.log(percent);
        offer = parseInt(percent.percentage)

        console.log("4$$$$")
        console.log(percent.proId);

        return new Promise(async (resolve, reject) => {
            product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(percent.proId) })
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(percent.proId) }, {
                $set: {

                    productOffer: offer,
                }
            })

        })
    },
    deleteProductOffer: (proId) => {
        return new Promise(async (resolve, reject) => {
            product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) })
            console.log("***");
            console.log(product);

            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) }, {
                $set: { productOffer: 0 },
            }).then((response) => {
                resolve(response)
            })
        })
    },
    setBrandOffer: (percent) => {
        console.log(percent);
        offer = parseInt(percent.percentage)

        console.log("4$$$$")
        console.log(percent.brandId);

        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(percent.brandId) }, {
                $set: {

                    brandOffer: offer,
                }
            })

        })
    },
    deleteBrandOffer: (brandId) => {
        console.log(brandId);
        return new Promise(async (resolve, reject) => {


            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(brandId) }, {
                $set: { brandOffer: 0 },
            }).then((response) => {
                resolve(response)
            })
        })
    },
    incProduct:(productId,quantity) => {
        
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, 
        {
            $inc:{
                stock: quantity
            }
        }
        )
    },
    returnQuantity:(orderId)=>{
        return new Promise( async(resolve, reject) =>{
            let productReturned= await db.get().collection(collection.ORDER_COLLECTION).aggregate([

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
            console.log('-----productReturned-------');
            console.log(productReturned)
            console.log('-----productReturned-------');

            resolve(productReturned)
        })
        
    }
}