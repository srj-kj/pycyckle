var db= require('../config/connection')
var collection= require('../config/collection')
var objectId= require('mongodb').ObjectId
const { response } = require('express')
const { Collection } = require('mongodb')

module.exports ={

    newCategory:(catData) => {
        let response={}
        return new Promise(async(resolve, reject) => {
            // console.log(userData)
            let catFind = await db.get().collection(collection.CATEGORY_COLLECTION)
            .findOne({category: catData.category})

            if(catFind){
                response.catExist=true
                response.catError=true
                resolve(response)
            }
            else{
                
                console.log('hello there ----------------------------------------');
            console.log(catData)
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catData).then((data) => {

                resolve(data)
                console.log('data is here ----------------------------------------');
                console.log(data );
                
            }) 
            }

           
        })
    },

    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            // console.log('-----------------------------------------------------------------')
            // console.log(users)
            resolve(category)
        })
    },
    getCat:(catID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).find({
                _id:{
                    $nin:[catID]
                }
            }).toArray().then((data)=>{
            
                resolve(data)
            })
        })
    },
    newBrand:(brandData) => {
        let response={}
        return new Promise(async(resolve, reject) => {
            // console.log(userData)
            let brandFind = await db.get().collection(collection.BRAND_COLLECTION)
            .findOne({BRAND: brandData.brand})

            if(brandFind){
                response.brandExist=true
                response.brandError=true
                resolve(response)
            }
            else{
                
                console.log('hello there ----------------------------------------');
            console.log(brandData)
            db.get().collection(collection.BRAND_COLLECTION).insertOne(brandData).then((data) => {

                resolve(data)
                console.log('data is here ----------------------------------------');
                console.log(data );
                
            }) 
            }

           
        })
    },

    getAllBrands:()=>{
        return new Promise(async(resolve,reject)=>{
            let brand =await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            // console.log('-----------------------------------------------------------------')
            // console.log(users)
            resolve(brand)
        })
    },
    getBrandProducts:(brandId)=>{
        return new Promise(async(resolve, reject)=>{
          let brandProducts=  await db.get().collection(collection.BRAND_COLLECTION).aggregate([
                {
                    $match : { _id : objectId(brandId)}
                },
                {
                    $lookup:{
                        from: 'product',
                        localField: '_id',
                        foreignField:'brand',
                        as:'brandProducts'

                    }
                },{
                    $unwind: '$brandProducts'
                },
                {
                    $project: {
                        brand:1, brandOffer:1, brandProducts: 1,
                        biggerDiscount:
                        {
                            $cond:
                            {
                                if:
                                {
                                    $gt: [
                                        { $toInt: '$brandProducts.productOffer' },
                                        { $toInt: '$brandOffer' }
                                    ]
                                }, then: '$brandProducts.productOffer', else: '$brandOffer'
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
                                            { $toInt: '$brandProducts.price' },
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
                                    { $toInt: '$brandProducts.price' },
                                    { $toInt: "$discountedAmount" }]
                            }
                        }
                    }
                }
            ]).toArray()
            console.log('****************************************');
            console.log(brandProducts)
            console.log('****************************************');

            resolve(brandProducts)

        })
    }
}