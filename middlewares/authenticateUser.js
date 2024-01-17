
const {verifyToken} = require('../utils/jwt')



    const authenticateUser = (req, res, next)=>{
    const token = req.signedCookies.token
    if(!token){
        res.status(403).json("Authentication invalid")
    }
    try{
    const {name, id, role } =  verifyToken({payload:token})
    req.user = {name, id, role}
    next()
    }
    catch(error){
        throw new Error(error)
    }
}

const authorizePermissions = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({ error: "You do not have permission to visit this route" });
        }
        next()
    }
}


module.exports = {authenticateUser, authorizePermissions}