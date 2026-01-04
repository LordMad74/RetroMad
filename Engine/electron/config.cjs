const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class ConfigManager {
    constructor() {
        this.configPath = path.join(this.getDataPath(), 'config.json');
        this.config = this.loadConfig();
    }

    getDataPath() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(path.join(__dirname, '../../Content'));
        } else {
            return path.join(path.dirname(process.execPath), 'Content');
        }
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            }
        } catch (e) {
            console.error("Error loading config:", e);
        }
        return {
            kiosk: {
                enabled: false,
                theme: 'neon_arcade'
            }
        }; // Default config
    }

    saveConfig() {
        try {
            // Ensure dir exists
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
        } catch (e) {
            console.error("Error saving config:", e);
        }
    }

    get(key) {
        return key ? this.config[key] : this.config;
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
        return this.config;
    }

    // Specific helpers
    setKioskMode(enabled, theme) {
        this.config.kiosk = { enabled, theme };
        this.saveConfig();
    }
}

module.exports = new ConfigManager();
