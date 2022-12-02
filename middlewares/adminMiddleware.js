module.exports={
    verifyAdmin:(req, res, next)=> {
         if (req.session.adminLogged){
             res.redirect('/admin')
        }else{
            // req.session.urlHistory=req.url
            return next();
         }
         
     },
     verifyLogout:(req, res, next)=> {
        if (!req.session.adminLogged){
            res.redirect('/admin/login')
            
        }else{
            // req.session.urlHistory=req.url
            next()
        }
     }
 }

