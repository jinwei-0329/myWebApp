const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017";
const DB_NAME = 'user-account';
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection (simple approach - new connection per request)
async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        return client.db(DB_NAME);
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

// Initialize default user
async function initDefaultUser() {
    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ userid: 1 });
        
        if (!user) {
            await db.collection('users').insertOne({
                userid: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                interests: 'coding, reading, music'
            });
            console.log('Default user created');
        }
    } catch (error) {
        console.error('Failed to initialize default user:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-profile', async (req, res) => {
    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ userid: 1 });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Database operation failed' });
    }
});

app.post('/update-profile', async (req, res) => {
    try {
        const db = await connectDB();
        const userData = { ...req.body, userid: 1 };
        
        const result = await db.collection('users').updateOne(
            { userid: 1 },
            { $set: userData },
            { upsert: true }
        );
        
        res.json({ ...userData, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

app.get('/profile-picture', (req, res) => {
    const imgPath = path.join(__dirname, 'profile-1.jpg');
    
    if (!fs.existsSync(imgPath)) {
        return res.status(404).json({ error: 'Profile picture not found' });
    }
    
    res.sendFile(imgPath);
});

// Start server with initialization
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initDefaultUser();
});