const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class ManufacturerManager {
    constructor() {
        this.dataPath = this.getDataPath();
        this.filePath = path.join(this.dataPath, 'manufacturers.json');
        this.manufacturers = this.load();
    }

    getDataPath() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(path.join(__dirname, '../../Content'));
        } else {
            return path.join(path.dirname(process.execPath), 'Content');
        }
    }

    load() {
        if (fs.existsSync(this.filePath)) {
            try {
                return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            } catch (e) {
                console.error("Failed to load manufacturers", e);
                return [];
            }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.manufacturers, null, 2));
    }

    getAll() {
        return this.manufacturers;
    }

    add(name, logo = null) {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Check if exists
        if (this.manufacturers.find(m => m.id === id)) return { error: "Exists" };

        // Handle Logo Download/Storage if URL (skipped for brevity, assume URL or local path passed)
        // Ideally we follow emulators.cjs pattern of downloading to local media.
        // For now, let's assume raw URL or user manages it.

        this.manufacturers.push({ id, name, logo });
        this.save();
        return { success: true, id };
    }

    delete(id) {
        this.manufacturers = this.manufacturers.filter(m => m.id !== id);
        this.save();
        return { success: true };
    }

    update(id, data) {
        const idx = this.manufacturers.findIndex(m => m.id === id);
        if (idx !== -1) {
            this.manufacturers[idx] = { ...this.manufacturers[idx], ...data };
            this.save();
            return { success: true };
        }
        return { error: 'Not found' };
    }
}

module.exports = new ManufacturerManager();
