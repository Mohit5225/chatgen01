const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        const db = client.db('chatbot'); // Replace 'chatbot' with your database name
        return db;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

module.exports = { connectToDatabase };
