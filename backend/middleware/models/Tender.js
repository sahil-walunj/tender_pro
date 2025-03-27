// Tender.js (Mongoose model)
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    pdfdata: {
        type: String, // Store the file path
        required: true,
    },
    adminstothis: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin', // Reference to the Admin who added the tender
        }
    ],
    appliedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the Users who applied for the tender
        }
    ],
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application', // Reference to the Users who applied for the tender
        }
    ]
}, {
    timestamps: true,
});

const Tender = mongoose.model('Tender', tenderSchema);

module.exports = Tender;
