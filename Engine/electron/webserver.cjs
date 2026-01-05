const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { app, desktopCapturer } = require('electron');
const os = require('os');
const { Bonjour } = require('bonjour-service');
const streamIntervals = new Set(); // Track active streams

class WebServer {
    constructor() {
        this.server = null;
        this.port = 3000;
        this.app = express();
        this.contentPath = this.getDataPath();
        this.logPath = path.join(this.contentPath, 'server.log');
        this.bonjour = new Bonjour();
        this.service = null;
        this.log('Web Server Initializing...');
    }

    log(msg) {
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] ${msg}\n`;
        console.log(line.trim());
        try {
            fs.appendFileSync(this.logPath, line);
        } catch (e) {
            console.error('Failed to write to log file', e);
        }
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

        // Middleware for CORS and Security
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

            // Required for resources to be loaded when COEP is active on the main page
            res.header('Cross-Origin-Resource-Policy', 'cross-origin');
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

        // API: Get Games List for Mobile
        this.app.get('/api/games', (req, res) => {
            const dbPath = path.join(this.contentPath, 'gamelist.json');
            if (fs.existsSync(dbPath)) {
                res.sendFile(dbPath);
            } else {
                res.json({ games: [] });
            }
        });

        // API: Get Server Logs
        this.app.get('/api/logs', (req, res) => {
            if (fs.existsSync(this.logPath)) {
                res.sendFile(this.logPath);
            } else {
                res.send('No logs found.');
            }
        });

        // API: Serve ROM file by ID (handles absolute paths correctly)
        this.app.get('/rom/:id', (req, res) => {
            this.log(`Request: ROM ID ${req.params.id}`);
            const dbPath = path.join(this.contentPath, 'gamelist.json');
            if (!fs.existsSync(dbPath)) {
                this.log('Error: DB not found');
                return res.status(404).send('DB not found');
            }

            try {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const game = db.games.find(g => g.id === req.params.id);
                if (game && game.path && fs.existsSync(game.path)) {
                    this.log(`Serving ROM: ${game.path}`);
                    res.sendFile(game.path);
                } else {
                    this.log(`Error: ROM file not found for ID ${req.params.id}`);
                    res.status(404).send('ROM file not found on disk');
                }
            } catch (e) {
                this.log(`Server Error: ${e.message}`);
                res.status(500).send('Server Error');
            }
        });

        // Route to serve Web Portal (Mobile Controller)
        this.app.get('/portal', (req, res) => {
            // Indispensable pour l'émulation locale sur mobile
            res.header('Cross-Origin-Embedder-Policy', 'require-corp');
            res.header('Cross-Origin-Opener-Policy', 'same-origin');
            res.sendFile(path.join(__dirname, '../web/index.html'));
        });

        // Redirect root to /portal for convenience
        this.app.get('/', (req, res) => {
            res.redirect('/portal');
        });

        // Serve Static Files (AFTER Portal/API)
        this.app.use('/', express.static(this.contentPath));

        // Video Stream Endpoint (MJPEG)
        this.app.get('/video/stream', async (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
                'Cache-Control': 'no-cache',
                'Connection': 'close',
                'Pragma': 'no-cache'
            });

            const streamInterval = setInterval(async () => {
                try {
                    const sources = await desktopCapturer.getSources({
                        types: ['screen'],
                        thumbnailSize: { width: 854, height: 480 } // Optimize for mobile (480p)
                    });

                    if (sources.length > 0) {
                        // Usually the first screen is the main one
                        const img = sources[0].thumbnail.toJPEG(60); // 60% quality for speed

                        res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${img.length}\r\n\r\n`);
                        res.write(img);
                        res.write('\r\n');
                    }
                } catch (e) {
                    console.error('Stream capture error:', e);
                }
            }, 100);

            req.on('close', () => {
                clearInterval(streamInterval);
            });
        });

        this.server = this.app.listen(this.port, '0.0.0.0', () => {
            const hostname = os.hostname();
            console.log(`Web Server running at http://localhost:${this.port}`);
            try {
                // Ensure unique name on network with random suffix
                const serviceName = `RetroMad-${hostname}-${Math.floor(Math.random() * 1000)}`;
                this.service = this.bonjour.publish({
                    name: serviceName,
                    type: 'http',
                    port: this.port
                });
                this.service.on('error', (err) => {
                    this.log(`Bonjour Error: ${err.message}`);
                });
            } catch (e) {
                this.log(`MDNS Start failed: ${e.message}`);
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
