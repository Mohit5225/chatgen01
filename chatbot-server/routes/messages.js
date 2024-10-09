const express = require('express');
const axios = require('axios');
const nlp = require('compromise'); // Import compromise library
const router = express.Router();

// Process message using compromise for intent detection
const processMessage = async (userMessage) => {
    console.log('Received message:', userMessage); // Debugging line
    let doc = nlp(userMessage.toLowerCase());
    let response = { type: 'text', message: 'Sorry, I did not understand that.' };

    if (doc.has('weather')) {
        console.log('Weather intent detected'); // Debugging line
        response.message = await handleWeatherRequest(doc);
    } else if (doc.has('news')) {
        response.message = 'Fetching news is not yet implemented.';
    } else if (doc.has('time')) {
        response.message = `The current time is ${new Date().toLocaleTimeString()}.`;
    }

    return response;
};

// Fetch weather data based on parsed city
const handleWeatherRequest = async (doc) => {
    console.log('Handling weather request'); // Debugging line
    let city = doc.match('#City').text();
    console.log('Detected city:', city); // Debugging line

    if (!city) {
        return 'Please specify a city name for the weather information.';
    }

    const apiKey = '49f2de9d57b59007624540f431c25fac';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;

    console.log('Weather API URL:', url); // Debugging line

    try {
        const response = await axios.get(url);
        const weather = response.data;
        console.log('Weather data received:', weather); // Debugging line
        return `Weather in ${weather.name}: ${weather.weather[0].description}, Temp: ${(weather.main.temp - 273.15).toFixed(2)} °C`;
    } catch (error) {
        console.error('Error fetching weather data:', error); // Debugging line
        return 'Error fetching weather data';
    }
};

// API endpoint to process user messages
router.post('/', async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        const response = await processMessage(userMessage);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error processing message' });
    }
});

module.exports = router;
