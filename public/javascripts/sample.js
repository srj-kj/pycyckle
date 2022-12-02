var toastMixin = Swal.mixin({
    toast: true,
    icon: 'success',
    title: 'General Title',
    animation: false,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

document.querySelector(".first").addEventListener('click', function(){
  Swal.fire({
    toast: true,
    icon: 'success',
    title: 'Posted successfully',
    animation: false,
    position: 'bottom',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
});

document.querySelector(".second").addEventListener('click', function(){
  toastMixin.fire({
    animation: true,
    title: 'Signed in Successfully'
  });
});

document.querySelector(".third").addEventListener('click', function(){
  toastMixin.fire({
    title: 'Wrong Password',
    icon: 'error'
  });
});

function razorpayPayment(order) {
    console.log(order)
    var options = {
        "key": "rzp_test_nKQWJAxWQhoKbk", // Enter the Key ID generated from the Dashboard
        "amount": order.amount,
           // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Picykle",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}






function changeQuantity(cartId,proId,userId,count){
  let quantity=parseInt(document.getElementById(proId).innerHTML)
  let total=parseInt(document.getElementById(proId+"total").innerHTML)
  let prodtotal=parseInt(document.getElementById(proId+"price").innerHTML)
  
  $.ajax({
    url:'/changeProductQuantity',
    data:{
      
      cart:cartId,
      product:proId,
      count:count,
      quantity:quantity,
      user:userId
    },
    method:'post',
    success:(response)=>{
      if(response.decLimit){
        document.getElementById(proId+"decrement").style.display="none"
       alert("select atleast one quantity or remove item")
      // document.getElementById("stockMessage").innerHTML="select atleast one quantity or remove item"
        
      }
      else{

        if(response.outOfStockErr){
          document.getElementById(proId+"increment").style.display="none"
          document.getElementById(proId+"stockMessage").innerHTML="Out of stock"
          // alert("product is out of stock")
        }else{
        document.getElementById(proId+"increment").style.display="inline"
        document.getElementById(proId+"decrement").style.display="inline"
        document.getElementById(proId+"stockMessage").innerHTML=""
        


        document.getElementById(proId).innerHTML=quantity+count
        document.getElementById(proId + "total").innerHTML=document.getElementById(proId).innerHTML*prodtotal
        
        if(response.couponOffer[0].discountedPrice){
          document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
          document.getElementById('coupon-price').innerHTML=response.couponOffer[0].discountedPrice
          
          document.getElementById('Grandtotal').innerHTML=document.getElementById('subtotal').innerHTML-response.couponOffer[0].discountedPrice
        }else{
          document.getElementById('Grandtotal').innerHTML=response.total[0].totalAmount
          document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
        }
        


        }	
        

        
         
      }
    }
  })
}
changeProductQuantity:({cart,product,count,quantity})=>{
   let response={}
   
    count=parseInt(count)
    return new Promise(async(resolve,reject)=>{

        if(quantity==1&&count==-1){
            response.decLimit=true
            reject(response)
        }else{
            if(count!=-1){
                let stockCheck = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(product)})
                 if(quantity >= stockCheck.stock){
                    response.outOfStockErr=true
                    reject(response)
                }else{

                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'products.item':objectId(product),_id:objectId(cart)},
                    {
                        $inc:{'products.$.quantity':count}
                    }
                    
                    ).then(async(data)=>{

                     response.decLimit=false
                     
                    response.outOfStockErr=false
                    resolve(response) 
                    }).catch((err)=>{
                        let error={}
                        error.message = "Something went wrong"
                        reject(error)
                    })
                }
            }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({'products.item':objectId(product),_id:objectId(cart)},
                {
                    $inc:{'products.$.quantity':count}
                }
                
                ).then(async(data)=>{

                 response.decLimit=false
                response.outOfStockErr=false
                resolve(response)  
                }).catch((err)=>{
                    let error={}
                error.message = "Something went wrong"
                reject(error)
                })
            }        
            }
    })
},





function changeQuantity(cartId,proId,userId,count){
  let quantity=parseInt(document.getElementById(proId).innerHTML)
  let total=parseInt(document.getElementById(proId+"total").innerHTML)
  let prodtotal=parseInt(document.getElementById(proId+"price").innerHTML)
  
  $.ajax({
    url:'/changeProductQuantity',
    data:{
      
      cart:cartId,
      product:proId,
      count:count,
      quantity:quantity,
      user:userId
    },
    method:'post',
    success:(response)=>{
      if(response.decLimit){
        document.getElementById(proId+"decrement").style.display="none"
       alert("select atleast one quantity or remove item")
      // document.getElementById("stockMessage").innerHTML="select atleast one quantity or remove item"
        
      }
      else{

        if(response.outOfStockErr){
          document.getElementById(proId+"increment").style.display="none"
          document.getElementById(proId+"stockMessage").innerHTML="Out of stock"
          // alert("product is out of stock")
        }else{
        document.getElementById(proId+"increment").style.display="inline"
        document.getElementById(proId+"decrement").style.display="inline"
        document.getElementById(proId+"stockMessage").innerHTML=""
        


        document.getElementById(proId).innerHTML=quantity+count
        document.getElementById(proId + "total").innerHTML=document.getElementById(proId).innerHTML*prodtotal
        
        if(response.couponOffer[0].discountedPrice){
          document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
          document.getElementById('coupon-price').innerHTML=response.couponOffer[0].discountedPrice
          
          document.getElementById('Grandtotal').innerHTML=document.getElementById('subtotal').innerHTML-response.couponOffer[0].discountedPrice
        }else{
          document.getElementById('Grandtotal').innerHTML=response.total[0].totalAmount
          document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
        }
        


        }	
        

        
        
      }
    }
  })
}



const getShoppage = async (req, res, next) => {

  // let products = await productHelpers.getAllProducts()
  let cart = await cartHelpers.getCartProducts(user._id)
  let wishlist = await wishlistHelpers.getWishlist(user._id)
  let newProducts = await productHelpers.getNewForShopPage()

  let productsCount = await db.get().collection(PRODUCTS_COLLECTION).count()


  // pagination start-----------------------------------------
  let results = {}

  page = parseInt(req.query.page) - 1 || 0

  limit = 9
  startIndex = (page) * limit
  endIndex = (page + 1) * limit

  productsCount = await db.get().collection(PRODUCTS_COLLECTION).count()

  if (endIndex < productsCount) {
      results.next = {
          page: page + 2,
          limit: limit
      }
  }

  if (page > 0) {
      results.previous = {
          page: page,
          limit: limit
      }
  }
  results.products = await productHelpers.getAllProducts(startIndex, limit)
  // pagination end-----------------------------------------

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
  //finding products in wishlist
  for (i = 0; i < wishlist.length; i++) {
      for (j = 0; j < results.products.length; j++) {
          wishlistId = wishlist[i].product._id.toString()
          productId = results.products[j]._id.toString()
          if (wishlistId == productId) {
              results.products[j].productInWishlist = true
          }
      }
  }

  res.render('user/shop/shop', { results, newProducts, productsCount })

}

('#coupon-check').submit((e)=>{
  e.preventDefault();
  $.ajax({
    url:'/coupon/submit',
    method:'post',
    data:$('#coupon-check').serialize(),
    success:(response)=>{

    }
  })
})

$('#coupon-form').submit((e) => {
  e.preventDefault()

  $.ajax({
      url: '/coupon-submit',
      method: 'post',
      data: $('#coupon-form').serialize(),
      success: (response) => {
          var err = document.getElementById('coupn-err')
          if (response.invalid) {
              err.innerHTML = "Enter a valid Coupon!"
          } else if (response.dateErr) {
              err.innerHTML = "Coupon has expired "
          } else if (response.used) {
              err.innerHTML = "You have already used this coupon!"
          } else {
              Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Coupon has been successfully Applied!',
                  showConfirmButton: false,

                  timer: 1500
              })
   
          }
      }

  })
})

$('#coupon-form').submit((e) => {
  e.preventDefault()

  $.ajax({
      url: '/coupon-submit',
      method: 'post',
      data: $('#coupon-form').serialize(),
      success: (response) => {
  console.log(response)
          var err = document.getElementById('coupn-err')
          if (response.invalid) {
              err.innerHTML = '<span style="color: red">Enter a valid Coupon!</span>'
          } else if (response.dateErr) {
              err.innerHTML = '<span style="color: red">Coupon has expired!</span>' 
          } else if (response.used) {
              err.innerHTML = '<span style="color: red">You have already used this coupon!</span>' 
          } else {
    err.innerHTML = '<span style="color: green">Coupon has been successfully Applied!</span>' 
              Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Coupon has been successfully Applied!',
                  showConfirmButton: false,

                  timer: 1500
              })
    response.discountedprice=parseInt(response.discountedprice)
    response.finalAmount=parseInt(response.finalAmount)
    
    
    document.getElementById('discounted-price').innerHTML= response.discountedprice
    document.getElementById('buying-price').innerHTML= response.finalAmount
    document.getElementById('discounted-price1').innerHTML= response.discountedprice
    document.getElementById('buying-price1').innerHTML= response.finalAmount
    document.getElementById('discount-coupon').innerHTML= response.coupon
    


   
          }
      }

  })
})




function pagination(e) {
 
  console.log(e)
  let pages = e
  
  $.ajax({
      url: '/orders/more',
      data: {
          pages: pages
          

      },
      method: 'post',
      success: (respose) => {
          console.log('-----------------------')
          
          console.log(respose)
          console.log('-----------------------')

          document.getElementById('p').innerHTML = respose

      }
  })
}

function deleteOffer(prouctId){
  console.log('helloo')
  swal({
title: "Are you sure?",
text: "Once deleted, you will not be able to recover this imaginary file!",
icon: "warning",
buttons: true,
dangerMode: true,
})
.then((willDelete) => {
if (willDelete) {
$.ajax({
  url:'/admin/delete/product/offer/'+prouctId,
  method:'get',
  success:(response)=>{
    if(response.status){
      
      swal("Poof! Your imaginary file has been deleted!", {
icon: "success",
}).then(()=>{
location.reload()
})
    }
       
  }
})

} 
});

}

//  getCheckoutData = (userId) => {
//   return new Promise(async (resolve, reject) => {
//       let cartTotal = await db.get().collection(CART_COLLECTION).aggregate([
//           {
//               $match: { user: objectId(userId) }
//           },
//           {
//               $unwind: '$products'
//           },
//           {
//               $project: {
//                   item: '$products.item',
//                   quantity: '$products.quantity'
//               }
//           },
//           {
//               $lookup: {
//                   from: PRODUCTS_COLLECTION,
//                   localField: 'item',
//                   foreignField: '_id',
//                   as: 'product'
//               }
//           },
//           {
//               $project: {
//                   item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
//               }
//           },
//           {
//               $lookup: {
//                   from: PRODUCTS_CATEGORIES_COLLECTION,
//                   localField: 'product.productCategories',
//                   foreignField: '_id',
//                   as: 'category'
//               }
//           },
//           {
//               $unwind: '$category'
//           },
//           {
//               $project: {
//                   item: 1, quantity: 1, product: 1, category: 1,
//                   biggerDiscount:
//                   {
//                       $cond:
//                       {
//                           if:
//                           {
//                               $gt: [
//                                   { $toInt: "$product.Discount" },
//                                   { $toInt: '$category.categoryDiscount' }
//                               ]
//                           }, then: "$product.Discount", else: '$category.categoryDiscount'
//                       }
//                   }
//               }
//           },
//           {
//               $addFields: {
//                   discountedAmount:
//                   {
//                       $round:
//                       {
//                           $divide: [
//                               {
//                                   $multiply: [
//                                       { $toInt: "$product.regularPrice" },
//                                       { $toInt: "$biggerDiscount" }
//                                   ]
//                               }, 100]
//                       }
//                   },
//               }
//           },
//           {
//               $addFields: {
//                   finalPrice:
//                   {
//                       $round:
//                       {
//                           $subtract: [
//                               { $toInt: "$product.regularPrice" },
//                               { $toInt: "$discountedAmount" }]
//                       }
//                   }
//               }
//           },
//           {
//               $addFields: {
//                   total: {
//                       $multiply: ["$quantity", { $toInt: "$finalPrice" }],
//                   }
//               }
//           },
//           {
//               $project: {
//                   _id: 1, total: 1
//               }
//           },
//           {
//               "$group": {
//                   "_id": "$_id",
//                   "cartTotal": {
//                       "$sum": "$total"
//                   }
//               }
//           }
//       ]).toArray()






        get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity',
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'productDetails',
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ['$productDetails', 0] },
            },
          },
          {
            $addFields: {
              totalQuantityPrice: {
                $multiply: ['$quantity', { $toInt: '$productDetails.Price' }],
              },
            },
          },
          {
            $lookup: {
              from: collection.CATEGORY_COLLECTION,
              localField: 'productDetails.Category',
              foreignField: 'CategoryName',
              as: 'category',
            },
          },
          {
            $unwind: '$category',
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: 1,
              totalQuantityPrice: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: '$productDetails.productOffer' },
                      { $toInt: '$category.CategoryOffer' },
                    ],
                  },
                  then: '$product.productOffer',
                  else: '$category.CategoryOffer',
                },
              },
            },
          },
          {
            $addFields: {
              discountedAmount: {
                $round: {
                  $divide: [
                    {
                      $multiply: [
                        { $toInt: '$productDetails.Price' },
                        { $toInt: '$discountOffer' },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: '$productDetails.Price' },
                    { $toInt: '$discountedAmount' },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }],
              },
            },
          },
        ])
        .toArray();
      resolve(cartItems);



      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity',
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'productDetails',
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ['$productDetails', 0] },
            },
          },
          {
            $addFields: {
              totalQuantityPrice: {
                $multiply: ['$quantity', { $toInt: '$productDetails.Price' }],
              },
            },
          },
          {
            $lookup: {
              from: collection.CATEGORY_COLLECTION,
              localField: 'productDetails.Category',
              foreignField: 'CategoryName',
              as: 'category',
            },
          },
          {
            $unwind: '$category',
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: 1,
              totalQuantityPrice: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: '$productDetails.productOffer' },
                      { $toInt: '$category.CategoryOffer' },
                    ],
                  },
                  then: '$product.productOffer',
                  else: '$category.CategoryOffer',
                },
              },
            },
          },
          {
            $addFields: {
              discountedAmount: {
                $round: {
                  $divide: [
                    {
                      $multiply: [
                        { $toInt: '$productDetails.Price' },
                        { $toInt: '$discountOffer' },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: '$productDetails.Price' },
                    { $toInt: '$discountedAmount' },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }],
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
        ])
        .toArray();




        doSignup: (userData) => {
          let response = {}
          return new Promise(async (resolve, reject) => {
              // console.log(userData)
              let userEmailFind = await db.get().collection(collection.USER_COLLECTION)
                  .findOne({ $or: [{ email: userData.email }, { phone: userData.phone }] })
                  console.log('-------------------------------');
                  console.log(userEmailFind);
                  console.log('-------------------------------');
  
  
              if (userEmailFind) {
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
                     
                      resolve(hash)
                      // console.log(hash);
                       
              
                      })
                    }
                    response.message = ""
            
            
                  }  
  
                  })
              },



            //   doSignup: (userData) => {
            //     let response = {}
            //     return new Promise(async (resolve, reject) => {
            //         // console.log(userData)
            //         let userEmailFind = await db.get().collection(collection.USER_COLLECTION)
            //             .findOne({ $or: [{ email: userData.email }, { phone: userData.phone }] })
        
            //         if (userEmailFind) {
            //             response.userExist = true
            //             response.emailError = true
            //             resolve(response)
            //         }
            //         else {
                        
            //             userData.Password = await bcrypt.hash(userData.Password, 10)
            //             console.log('hello there ----------------------------------------');
            //             console.log(userData)
            //             db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
        
            //                 resolve(data)
            //                 console.log('data is here ----------------------------------------');
            //                 console.log(data);
        
            //             })
            //         }
        
            //     })
            // },

            function addToCart(productId) {
              $.ajax({
                  url: '/add-to-cart/' + productId,
                  method: 'get',
                  success: (response) => {
                      if (response.status) {
                          let count = $('#cart-count').html()
                          count = parseInt(count) + 1
                          $('#cart-count').html(count)
      
                          Swal.fire({
                              toast: true,
                              icon: 'success',
                              title: 'Item added to cart',
                              animation: false,
                              position: 'top-right',
                              showConfirmButton: false,
                              timer: 1000,
                              timerProgressBar: true,
                              width: '300px'
                          })
      
                      }
                      alert(response)
                  }
              })
      
          }


          function sendData(e){
            const searchResults= document.getElementById('searchResults')
            fetch('search',{
                method:'post',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({payload: e.value})
            }).then(res =>res.json()).then(data=>{
                    console.log(data)
                let payload= data.payload
                searchResults.innerHTML=''
                if(payload.length < 1){
                    searchResults.innerHTML='<p>Sorry Nothing Found</p>'
                    return;
                }
                console.log(payload)
                payload.forEach((item, index)=>{
                    if(index > 0)searchResults.innerHTML += '<hr>'
                    searchResults.innerHTML += `<p>${item.productName}</p>`
                    searchResults.innerHTML+=`<a  href="/product/${item._id}">${item.productName}</a>`
            searchResults.innerHTML+=`<img style="width:30px; margin-left:-50px;margin-top:-40px;"  src="/images/${item.img[0]}"></img>`
                })
                return;
            })
        }