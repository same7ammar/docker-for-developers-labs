const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());

// Home page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Express Docker App</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                h1 { margin-bottom: 20px; }
                .info { margin: 10px 0; opacity: 0.9; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📦 Node.js Express App</h1>
                <p class="info">Hostname: ${os.hostname()}</p>
                <p class="info">Environment: ${NODE_ENV}</p>
                <p class="info">Node Version: ${process.version}</p>
                <p class="info">Running in Docker! 🐳</p>
            </div>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        hostname: os.hostname(),
        uptime: process.uptime()
    });
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        application: 'Node.js Express Sample',
        version: '1.0.0',
        hostname: os.hostname(),
        environment: NODE_ENV,
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        memory: {
            total: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
            free: Math.round(os.freemem() / 1024 / 1024) + ' MB'
        }
    });
});

// Sample users endpoint
app.get('/api/users', (req, res) => {
    res.json({
        users: [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' },
            { id: 3, name: 'Charlie', email: 'charlie@example.com' }
        ]
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Hostname: ${os.hostname()}`);
});
