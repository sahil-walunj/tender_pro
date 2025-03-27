require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin.js');
const userRoutes = require('./routes/user.js');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Serve uploaded files

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


