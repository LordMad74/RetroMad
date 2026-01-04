const axios = require('axios');

const SYSTEM_WIKI_MAP = {
    'nes': 'Nintendo_Entertainment_System',
    'snes': 'Super_Nintendo',
    'megadrive': 'Mega_Drive',
    'psx': 'PlayStation',
    'n64': 'Nintendo_64',
    'master_system': 'Master_System',
    'gameboy': 'Game_Boy',
    'gba': 'Game_Boy_Advance',
    'gbc': 'Game_Boy_Color',
    'gamegear': 'Game_Gear',
    'ngp': 'Neo-Geo_Pocket',
    'wonderswan': 'WonderSwan',
    'pcengine': 'PC-Engine',
    'arcade': "Borne_d'arcade",
    'mame': "Borne_d'arcade",
    'neogeo': 'Neo-Geo'
};

class WikiScraper {
    async getSystemInfo(systemId) {
        const title = SYSTEM_WIKI_MAP[systemId.toLowerCase()] || systemId;
        const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${title}`;

        try {
            console.log(`Fetching Wiki for ${systemId} -> ${url}`);
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    // Wikipedia requires a descriptive User-Agent
                    'User-Agent': 'RetroMad/1.0 (retroamusement@gmail.com) electron-app'
                }
            });
            const data = response.data;

            if (data) {
                return {
                    description: data.extract,
                    thumbnail: data.thumbnail ? data.thumbnail.source : null,
                    image: data.originalimage ? data.originalimage.source : null,
                    year: data.description ? data.description : 'N/A', // Sometimes contains year/type
                    title: data.title
                };
            }
        } catch (error) {
            console.error(`Wiki fetch failed for ${systemId}:`, error.message);
        }
        return null;
    }
}

module.exports = new WikiScraper();
