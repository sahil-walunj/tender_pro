const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    pdfdata: {
        type: String, // Store the file path
        required: true,
    },
    price: {
        type: String, // Store the file path
        required: true,
    },
    User: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tender', 
        }
    ],
    price:{
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const Application = mongoose.model('Application', tenderSchema);

module.exports = Application;
