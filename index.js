const express = require('express');
const moment = require('moment-timezone');
const axios = require('axios');

const app = express();

// Cache the expiration time to avoid fetching it every time
let expirationTimeUTC = null;

// Function to fetch current UTC time from World Time API
const getCurrentUTCTime = async () => {
    try {
        const response = await axios.get('https://worldtimeapi.org/api/ip');
        const data = response.data;
        return moment.utc(data.utc_datetime);
    } catch (error) {
        console.error('Error fetching current UTC time:', error);
        return null;
    }
};

// Middleware to check if the request is made before expiration time
const checkExpiration = async (req, res, next) => {
    console.log('Checking expiration...'); // Log message to confirm middleware is running

    // Set expiration time if not cached
    if (!expirationTimeUTC) {
        expirationTimeUTC = moment.utc('2024-09-28T19:10:00'); // Set expiration time to 7:05 PM UTC on September 28, 2024(12:25 AM IST on September 29, 2024)
    }

    const currentTimeUTC = await getCurrentUTCTime(); // Get current UTC time
    if (!currentTimeUTC) {
        return res.status(500).json({ error: 'Unable to fetch current UTC time' });
    }

    console.log(`Current UTC time: ${currentTimeUTC.format()}`); // Log the current UTC time

    if (currentTimeUTC.isBefore(expirationTimeUTC)) {
        next();
    } else {
        res.status(403).json({ error: 'API expired' });
    }
};


// Route to generate random data
app.get('/random-data', checkExpiration, (req, res) => {
    const randomData = Math.random(); // Generate random data
    res.json({ randomData });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});