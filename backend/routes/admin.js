const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../middleware/models/admin.js');
const Tender = require('../middleware/models/Tender.js');
const { protect, isAdmin } = require('../middleware/auth.js');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer to store files in the 'uploads' folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload to 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    }
});

// Create the multer instance
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // Limit file size to 50MB

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Admin Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create a new admin
        const admin = await Admin.create({ username, email, password });

        // Respond with a success message
        res.status(201).json({
            message: 'Admin registered successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up admin', error: error.message });
    }
});

// Admin Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    try {
        // Ensure password is a string before comparison
        const passwordStr = password.toString(); // Convert to string
        const admin = await Admin.findOne({ username });

        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.matchPassword(passwordStr); // Pass the string
        console.log('Password match:', isMatch);

        if (isMatch) {
            // If password matches, generate a token and return user details
            res.json({
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                role: 'admin',
                token: generateToken(admin._id),
            });
        } else {
            console.log('Incorrect password');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Add Tender Route
router.post('/addtender', protect, isAdmin, upload.single('pdfdata'), async (req, res) => {
    const { title, description } = req.body;

    try {
        if (!title || !req.file || !description) {
            return res.status(400).json({ message: 'Title and PDF file and Description are required' });
        }

        // Store the full URL of the uploaded PDF
        const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newTender = new Tender({
            title,
            description,
            pdfdata: pdfUrl, // Store URL instead of local path
            adminstothis: [req.user._id],
        });

        const savedTender = await newTender.save();

        // Update the admin's `tendersowned` array
        await Admin.findByIdAndUpdate(
            req.user._id,
            { $push: { tendersowned: savedTender._id } }, 
            { new: true, useFindAndModify: false }
        );

        res.status(201).json({
            message: 'Tender added successfully',
            tender: {
                id: savedTender._id,
                title: savedTender.title,
                description: savedTender.description,
                pdfdata: savedTender.pdfdata, // Now a full URL
                createdAt: savedTender.createdAt,
            },
        });
    } catch (error) {
        console.error('Error adding tender:', error);
        res.status(500).json({ message: 'Error adding tender', error: error.message });
    }
});




// Protected admin dashboard
router.get('/dashboard', protect, isAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id); // Fetch the logged-in admin's data
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/applications', protect, isAdmin, async (req, res) => {
    const tenderid=req.query;
    try {
        const tenderdata = await Tender.findById(tenderid);
        if (!tenderdata) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.sendStatus(200).json(tenderdata);
    } catch (error) {
        res.status(500).json({ message:'Server error',error: error.message });
    }
});


module.exports = router;

