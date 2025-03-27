const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../middleware/models/admin.js');
const User = require('../middleware/models/User.js');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Set the user object in request
            req.user = await Admin.findById(decoded.id).select('-password') || 
                       await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, invalid token', error: error.message });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware to check for admin role
const isAdmin = async (req, res, next) => {
    try {
        // Check if the user is in the Admin collection
        const admin = await Admin.findById(req.user._id);

        if (!admin) {
            return res.status(403).json({ message: 'Access denied, not an admin' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin role', error: error.message });
    }
};
const isUser = async (req, res, next) => {
    try {
        // Check if the user is in the Admin collection
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(403).json({ message: 'Access denied, not an user' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying user role', error: error.message });
    }
};
module.exports = { protect, isAdmin, isUser };
