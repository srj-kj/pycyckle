const mongoClient=require('mongodb').MongoClient


const state={
    db:null
}

module.exports.connect = function(done){
    // const url = 'mongodb://127.0.0.1:27017'
    const url ='mongodb+srv://surajkj:Suraj222317@cluster0.p1rcydn.mongodb.net/test'
    const dbname= 'picykle'
    mongoClient.connect(url,(err,data)=>{
        if(err){ 
            console.log(err);
            return done(err)}
            else{
                console.log("cconnected");
            }
        state.db=data.db(dbname)
    })
    done()      
}

module.exports.get = function(){
    return state.db
}
