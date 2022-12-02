var db= require('../config/connection')
var collection= require('../config/collection')
var objectId= require('mongodb').ObjectId
const { response } = require('express')

module.exports = {
    addBanner:(bannerdata) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerdata).then((data)=>{
                resolve(data)
            })
        })
    },
    getAllBanners:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
            })
        })
    },
    editBanner:async (bannerId,bannerDetails)=>{
        const response = await new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) },

                {
                    $set: {
                        title: bannerDetails.title,
                        subtitle: bannerDetails.subtitle,
                        price: bannerDetails.price,
                        img: bannerDetails.img,
                    }
                }

            ).then((response) => {
                resolve(response)
            })
        })
        
    },
    getBanner: (bannerId) => {
        console.log(bannerId);
        console.log('call is here');
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)}).
            then((banner)=>{
                resolve(banner)
            })
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)}).then((response)=>{
                resolve(response)
            })
        })
    }
}