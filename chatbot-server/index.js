 // Load environment variables from .env file
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./db'); // Import the database connection function
const app = express();
const port = process.env.PORT || 3001;

// Middleware

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Route for authentication
app.use('/api/auth', require('./routes/auth'));

// Route for processing user messages
app.use('/api/messages', require('./routes/messages'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Call the function to connect to the database
connectToDatabase().then(db => {
    app.locals.db = db; // Make the database instance available to routes
}).catch(err => {
    console.error('Failed to connect to the database:', err);
});
