var db= require('../config/connection')
var collection= require('../config/collection')
var objectId= require('mongodb').ObjectId
const { response } = require('express')

module.exports = {
    addAddress:(addressData,userId) => {
        let response={}
        return new Promise(async(resolve, reject) => {
            // console.log(userData)
            let addressObj={
                
                userId:objectId(userId),
                firstName:addressData['first-name'],
                lastName:addressData['last-name'],
                country:addressData.country,
                town:addressData.town,
                address:addressData.address,
                phone:addressData.phone,
                email:addressData.email,
                state:addressData.state,
                pincode:addressData.pincode
            }
                console.log('hello there ----------------------------------------');
            console.log(addressData)
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then((data) => {

                resolve(data)
                console.log('data is here ----------------------------------------');
                console.log(data );
                
            })  
        })
    },

    

    getAllAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let address =await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).toArray()
            // console.log('-----------------------------------------------------------------')
            // console.log(users)
            resolve(address)
        })
    },
}