const jwt = require('jsonwebtoken');
const User = require('../models/user.js');



// Middleware to Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select("-password"); // Exclude password
            next();
        } catch (error) {
            console.log("Token verification failed", error);
            res.status(401).json({message: 'Not authorized, token failed'})

            
        }
    } else{
        res.status(401).json({message : "Not authorized, no token provided"})
    }
};

// Midlleware to check if the user is an admin
const admin = async(req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success : false,
            message : "Not authorized! Admin rights required."
        });
    }
};


module.exports = {
    protect,
    admin
};