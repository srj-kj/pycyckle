var db= require('../config/connection')
var collection= require('../config/collection')
var objectId= require('mongodb').ObjectId
const { response } = require('express')

module.exports = {
    totalCodSales:()=>{
        return new Promise(async(resolve, reject)=>{
            let CodTotal= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'COD'
                    }
                },
                {
                    $project: 
                    {
                        totalAmount:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        CodTotal:
                        {
                            $sum:'$totalAmount'
                        }

                    }
                }
            ]).toArray();
            resolve(CodTotal)
        })
    },
    totalRazorpaySales:()=>{
        return new Promise(async(resolve, reject)=>{
            let razorpayTotal= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'Razorpay'
                    }
                },
                {
                    $project: 
                    {
                        totalAmount:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        razorpayTotal:
                        {
                            $sum:'$totalAmount'
                        }

                    }
                }
            ]).toArray();
            resolve(razorpayTotal)
        })
    },
    // totalRazorpaySales:()=>{
    //     return new Promise(async(resolve, reject)=>{
    //         let razorpayTotal= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //             {
    //                 $match: 
    //                 {
    //                     paymentMethod:'Razorpay'
    //                 }
    //             },
    //             {
    //                 $project: 
    //                 {
    //                     totalAmount:1
    //                 }
    //             },
    //             {
    //                 $group: 
    //                 {
    //                     _id:null,
    //                     CodTotal:
    //                     {
    //                         $sum:'$totalAmount'
    //                     }

    //                 }
    //             }
    //         ]).toArray();
    //         resolve(razorpayTotal)
    //     })
    // },
    totalPaypalSales:()=>{
        return new Promise(async(resolve, reject)=>{
            let paypalTotal= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: 
                    {
                        paymentMethod:'PayPal'
                    }
                },
                {
                    $project: 
                    {
                        totalAmount:1
                    }
                },
                {
                    $group: 
                    {
                        _id:null,
                        paypalTotal:
                        {
                            $sum:'$totalAmount'
                        }

                    }
                }
            ]).toArray();
            resolve(paypalTotal)
        })
    },
    getDailySalesReport:()=>{   
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:10
                },
 
            ]).toArray()
            console.log('Daily Sales');
            console.log(dailySales)
            resolve(dailySales)
   
        })
    },
    getMonthlySalesReport:()=>{
        return new Promise(async(resolve, reject) => {
            let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
               
               
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: {  format: "%Y-%m", date: "$isoDate"} },
                        total: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                }, 
                {
                    $sort:{_id:-1}  
                }
                
            ]).toArray()
            console.log(monthlySales)
            resolve(monthlySales)
        })
    },
    getYearlySalesReport:()=>{
        return new Promise(async(resolve, reject) => {
            let yearlySales =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            console.log('Yearly sales report')
            console.log(yearlySales);
            resolve(yearlySales)
        })
    },
    getDailySalesTotal:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySalesTotal=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1}
                       
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                },
                {
                    $limit:7
                },
                {
                    $project:{
                        totalAmount:1,
                    }
                },{
                    $group:{
                        _id:null,
                        total:{$sum:'$totalAmount'}
                    }
                }
               
   
            ]).toArray()
            console.log(dailySalesTotal[0].total)
            resolve(dailySalesTotal[0].total)
   
        })
    },
    getTotalSalesGraph:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:7
                },

            ]).toArray()


            let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
               
                
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:-1}
                }
               
            ]).toArray()

            let yearlySales =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            resolve({dailySales,monthlySales,yearlySales})


            
            })
    },

}