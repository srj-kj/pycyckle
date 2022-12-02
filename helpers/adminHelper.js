
var db= require('../config/connection')
var collection= require('../config/collection')
var objectId= require('mongodb').ObjectId
const { response } = require('express')
module.exports={
blockUSer:(userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                isBlocked: true
            }
        }).then((response) => {
            console.log("hellooooooooooooo")
            resolve(response);
        })

    })  
},
unblockUSer:(userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                isBlocked: false
            }
        }).then((response) => {
            console.log("hellooooooooooooo")
            resolve(response);
        })

    })  
},
getweekly:()=>{
    return new Promise(async(resolve, reject) => {
        let sales = await adb.get().collection(collection.ORDER_COLLECTION).aggregate([
         {
            $unwind:'$products'
        },{
            $match:{
                
            }
        }
    ])
    })
}

}