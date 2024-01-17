const jwt = require('jsonwebtoken')


const createToken = ({payload})=>{
    const token =  jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_LIFE_TIME
    })
    return token;
}

const verifyToken = ({payload})=>jwt.verify(payload, process.env.JWT_SECRET)


const attachCookiesToResponse = ({res, user})=>{
    const token = createToken({payload:user})
    const oneDay = 1000 * 60 * 60 *24;
    res.cookie('token', token, {
        httpOnly:true,
        expires:new Date(Date.now() + oneDay),
        secure:process.env.NODE_ENV === 'production',
        signed:true
    })
}


module.exports = {createToken, verifyToken, attachCookiesToResponse}
