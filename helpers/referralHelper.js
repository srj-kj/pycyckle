var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { Transactions } = require('express')
var code = require('voucher-code-generator');
const { ObjectId } = require('mongodb');
module.exports={
    addWallet:(userId)=>{
        console.log('call is coming here');
        return new Promise((resolve, reject) => {
         db.get().collection(collection.WALLET_COLLECTION).insertOne({
            userId:userId,
            balance:parseInt(0),
            Transactions:[]
         })
         
        })
    },
    getWallet:(userId)=>{
    return new Promise((resolve, reject) => {
        let wallet=db.get().collection(collection.WALLET_COLLECTION).findOne({userId:ObjectId(userId)})
        resolve(wallet)
    })
    },
    addAmount:(userId)=>{
        console.log("(((((");
        console.log(userId);
        return new Promise((resolve, reject) => {
            refferalData={
                amount:parseInt(50),
                date:new Date().toDateString(),
                Timestamp:new Date(),
                status:"credited",
                message:"Refferal Amount"
            }
          db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:ObjectId(userId)},{
            $inc:{
                balance:parseInt(50)
            },
            $push:{
                Transactions:refferalData
            }

          })
        })
    },
         refferalAmount:(reff,amount)=>{
        return new Promise(async(resolve, reject) => {
            console.log('---hi i am tony----');
            console.log(reff);
           let refferal=await db.get().collection(collection.USER_COLLECTION).findOne({refferals:reff.refferals})
           console.log(refferal);
           if(refferal){
            console.log('---hi i am tony here----');

            refferalData={
                amount:amount,
                date:new Date().toDateString(),
                Timestamp:new Date(),
                status:"credited",
                message:"Refferal Amount"
            }
           await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:(refferal._id)},{
                $inc:{
                    balance:amount
                },
                $push:{
                    Transactions:refferalData
                }
            })
            resolve()
         }
        })
    },
}