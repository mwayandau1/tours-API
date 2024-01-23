const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const { verifyToken } = require('../utils/jwt');

const authenticateUser = asyncHandler(async(req, res, next) => {
    const token = req.signedCookies.token;
    if (!token) {
        return res.status(401).json({ error: "Authentication invalid" });
    }
    try {
        const decoded= await verifyToken({ payload: token });
        const { name, id, role } = decoded
        const user = await User.findById(id)
        if(!user){
            return new CustomError("Token for this user does not exist", 401)
        }
        if(user.changePasswordAfter(decoded.iat)){
            return next(new CustomError("Password changed, Please log in again"))
        }
        req.user = { name, id, role };
        next();
    } catch (error) {
        throw new Error(error);
    }
});

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "You do not have permission to visit this route" });
        }
        next();
    };
};

module.exports = { authenticateUser, authorizePermissions };
