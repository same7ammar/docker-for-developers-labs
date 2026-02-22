const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const os = require('os');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://app:secret@localhost:5432/myapp'
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'healthy',
            hostname: os.hostname(),
            database: 'connected'
        });
    } catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            hostname: os.hostname(),
            database: 'disconnected',
            error: err.message
        });
    }
});

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Create new item
app.post('/api/items', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO items (name) VALUES ($1) RETURNING *',
            [name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating item:', err);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM items WHERE id = $1', [id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});