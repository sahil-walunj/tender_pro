const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tender = require('./Tender.js');


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    tendersapplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tender' }]
});


// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain-text password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
