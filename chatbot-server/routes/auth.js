const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { connectToDatabase } = require('../db'); // Adjust the path to point to your db.js


// Load environment variables
require('dotenv').config();

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;


// Route to register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    try {
        const db = req.app.locals.db; // Access the db instance from app.locals
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });


        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({ username, password: hashedPassword });


        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
   // Route to login a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const db = req.app.locals.db; // Use the db instance from app.locals
        const usersCollection = db.collection('users');

        // Find the user by username
        const user = await usersCollection.findOne({ username });

        console.log(user); // Add this line to check if the user data is retrieved

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token to the client
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
});



module.exports = router;
