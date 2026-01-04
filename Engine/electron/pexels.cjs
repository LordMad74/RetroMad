const { createClient } = require('pexels');

// WARNING: You must provide a valid API Key here.
// For now, I'm setting a placeholder. The user will need to input their key.
// Ideally, this should come from config.ini
const API_KEY = 'PLACEHOLDER_KEY';

let client = null;

const initClient = (key) => {
    if (key && key !== 'PLACEHOLDER_KEY') {
        client = createClient(key);
    }
};

const searchImage = async (query) => {
    if (!client) return null;
    try {
        // Fetch more results to allow randomization
        const result = await client.photos.search({ query, per_page: 30 });
        if (result.photos && result.photos.length > 0) {
            // Return a random photo from the results
            const randomIndex = Math.floor(Math.random() * result.photos.length);
            return result.photos[randomIndex];
        }
    } catch (error) {
        console.error("Pexels Image Error:", error);
    }
    return null;
};

const searchVideo = async (query) => {
    if (!client) return null;
    try {
        const result = await client.videos.search({ query, per_page: 1 });
        if (result.videos && result.videos.length > 0) {
            return result.videos[0];
        }
    } catch (error) {
        console.error("Pexels Video Error:", error);
    }
    return null;
};

module.exports = { initClient, searchImage, searchVideo };
