const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { app } = require('electron');
const os = require('os');
const { Bonjour } = require('bonjour-service');

class WebServer {
    constructor() {
        this.server = null;
        this.port = 3000;
        this.app = express();
        this.contentPath = this.getDataPath();
        this.bonjour = new Bonjour();
        this.service = null;
    }

    getDataPath() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(path.join(__dirname, '../../Content'));
        } else {
            return path.join(path.dirname(process.execPath), 'Content');
        }
    }

    getIPAddress() {
        const interfaces = os.networkInterfaces();
        let bestIP = 'localhost';

        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && !alias.internal) {
                    // Prioritize standard local subnet ranges
                    if (alias.address.startsWith('192.168.') ||
                        alias.address.startsWith('10.') ||
                        alias.address.startsWith('172.')) {
                        return alias.address;
                    }
                    bestIP = alias.address;
                }
            }
        }
        return bestIP;
    }

    start() {
        // Serve static assets for the web player if we had any
        // For now, let's just serve ROMs and a basic API

        // Middleware to allow CORS (important for mobile access)
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Serve Web Portal
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../web/index.html'));
        });

        // Serve Web Player
        this.app.get('/play/:system/:id', (req, res) => {
            res.sendFile(path.join(__dirname, '../web/play.html'));
        });

        // Route to serve ROMs
        this.app.get('/rom/:system/:id', (req, res) => {
            const { system, id } = req.params;
            const dbPath = path.join(this.contentPath, 'gamelist.json');

            if (fs.existsSync(dbPath)) {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const game = db.games.find(g => g.id === id);
                if (game && fs.existsSync(game.path)) {
                    res.sendFile(game.path);
                    return;
                }
            }
            res.status(404).send('Game not found');
        });

        // Route to serve Media (using static for stability)
        this.app.use('/media', express.static(this.contentPath));
        this.app.use('/content', express.static(this.contentPath)); // alias just in case

        // Basic API to get game list for mobile
        this.app.get('/api/games', (req, res) => {
            const dbPath = path.join(this.contentPath, 'gamelist.json');
            if (fs.existsSync(dbPath)) {
                res.sendFile(dbPath);
            } else {
                res.json({ games: [] });
            }
        });

        this.server = this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`Web Server running at http://localhost:${this.port}`);
            try {
                this.service = this.bonjour.publish({
                    name: 'RetroMad',
                    type: 'http',
                    port: this.port
                });
            } catch (e) {
                console.error('MDNS failed', e);
            }
        });
    }

    stop() {
        if (this.service) {
            try { this.service.stop(); } catch (e) { }
        }
        if (this.server) {
            this.server.close();
        }
    }

    getStatus() {
        const ip = this.getIPAddress();
        const hostname = os.hostname().toLowerCase();

        return {
            running: !!this.server,
            port: this.port,
            ip: ip,
            hostname: `${hostname}.local`,
            url: `http://${hostname}.local:${this.port}`,
            fallbackUrl: `http://${ip}:${this.port}`
        };
    }
}

module.exports = new WebServer();
