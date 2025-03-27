const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../middleware/models/User.js');
const { protect ,isUser} = require('../middleware/auth.js');
const Tender = require('../middleware/models/Tender.js');
const Application = require('../middleware/models/Application.js');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });


// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// User Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const user = await User.create({ username, email, password });

        // Respond with a success message
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up user', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ username });

        // Check if user exists and passwords match
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role:'user',
                token: generateToken(user._id), // Generate JWT token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

router.post('/applytender', protect, isUser, upload.single('pdfdata'), async (req, res) => {
    const { id, title, price } = req.body;

    try {
        // Debugging: Check if `req.user` is correctly populated
        console.log('User in request:', req.user);
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        if (!id || !req.file) {
            return res.status(400).json({ message: 'Tender ID and PDF application file are required' });
        }

        // Store the full URL of the uploaded PDF
        const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Create the application first
        const newApplication = await Application.create({
            title,
            pdfdata: pdfUrl,
            user: req.user._id,  // Ensure user is assigned
            price
        });

        console.log('New application created:', newApplication);

        if (!newApplication) {
            return res.status(500).json({ message: 'Failed to create tender application' });
        }

        // Update the Tender with appliedUsers & application ID
        const updatedTender = await Tender.findByIdAndUpdate(
            id,
            {
                $push: {
                    appliedUsers: req.user._id,
                    applications: newApplication._id,
                },
            },
            { new: true, useFindAndModify: false }
        );

        console.log('Updated Tender:', updatedTender);

        if (!updatedTender) {
            return res.status(500).json({ message: 'Failed to update tender details' });
        }

        // Update the User's tendersapplied array
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { tendersapplied: newApplication._id } }, // Add application ID to user
            { new: true, useFindAndModify: false }
        );

        console.log('Updated User:', updatedUser);

        if (!updatedUser) {
            return res.status(500).json({ message: 'Failed to update user details' });
        }

        res.status(201).json({
            message: 'Tender application submitted successfully',
            application: {
                id: newApplication._id,
                title: newApplication.title,
                pdfdata: newApplication.pdfdata,
                user: newApplication.user,  // Return user ID to confirm
                createdAt: newApplication.createdAt,
            },
        });

    } catch (error) {
        console.error('Error applying for tender:', error);
        res.status(500).json({ message: 'Error applying for tender', error: error.message });
    }
});


router.post('/search', async (req, res) => {
    const { name } = req.body;
    
    try {
        if(!name){
            return res.status(400).json({ message: 'Name is required' });
        }
        const tenders = await Tender.find({ title: { $regex: name, $options: 'i' } });
        res.status(200).json(tenders);
    } catch (error) {
        console.error('Error searching tenders:', error);
        res.status(500).json({ message: 'Error searching tenders', error: error.message });
    }
})
// Protected user dashboard
router.get('/info/:id', protect, isUser, async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id).select('title pdfdata description');
        if (!tender) {
            return res.status(404).json({ message: 'Tender not found' });
        }
        res.status(200).json(tender);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/top10', protect, isUser, async (req, res) => {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 }).limit(10).select('title pdfdata description');
        res.status(200).json(tenders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/dashboard', protect, isUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;
