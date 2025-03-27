// upload.js (multer configuration)
const multer = require('multer');
const path = require('path');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Save to "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size 50 MB
});

module.exports = upload;
