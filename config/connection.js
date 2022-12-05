const mongoClient=require('mongodb').MongoClient
// MongoClient.connect('mongodb://127.0.0.1:27017', function(err, client) {
//     if(err)
//         console.log('error');
//     else
//      client.db('Fincops').collection('users').insertOne(req.body)
// })

const state={
    db:null
}
module.exports.connect=function(done){
    // const url='mongodb://127.0.0.1:27017'
    const url ='mongodb+srv://surajkj:Suraj222317@cluster0.p1rcydn.mongodb.net/test'
    const dbname= 'picykle'
    mongoClient.connect(url,(err,data)=>{
         if(err)
            return done(err)}
        state.db=data.db(dbname)
    })
    done()
}

module.exports.get = function(){
    return state.db
}
