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

        this.app.use(express.json());

        // API: Get App Status
        this.app.get('/api/status', (req, res) => {
            res.json({
                version: '0.6.5',
                platform: process.platform,
                uptime: process.uptime()
            });
        });

        // API: Send Command to Main Process
        this.app.post('/api/command', (req, res) => {
            const { action, payload } = req.body;
            app.emit('remote-command', { action, payload });
            res.json({ success: true });
        });

        // Basic API to get game list for mobile
        this.app.get('/api/games', (req, res) => {
            const dbPath = path.join(this.contentPath, 'gamelist.json');
            if (fs.existsSync(dbPath)) {
                res.sendFile(dbPath);
            } else {
                res.json({ games: [] });
            }
        });

        // Serve Static Files (MUST BE AFTER API ROUTES)
        this.app.use('/', express.static(this.contentPath));

        // Route to serve Web Portal (Mobile Controller)
        this.app.get('/portal', (req, res) => {
            res.sendFile(path.join(__dirname, '../web/index.html'));
        });

        // Redirect root to portal or just keep as is
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../web/index.html'));
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
