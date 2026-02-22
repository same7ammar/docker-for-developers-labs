const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/health', async (req, res) => {
    const services = {};
    
    try {
        await axios.get(`${USER_SERVICE_URL}/health`, { timeout: 2000 });
        services.userService = 'healthy';
    } catch {
        services.userService = 'unhealthy';
    }
    
    try {
        await axios.get(`${PRODUCT_SERVICE_URL}/health`, { timeout: 2000 });
        services.productService = 'healthy';
    } catch {
        services.productService = 'unhealthy';
    }
    
    try {
        await axios.get(`${ORDER_SERVICE_URL}/health`, { timeout: 2000 });
        services.orderService = 'healthy';
    } catch {
        services.orderService = 'unhealthy';
    }
    
    const allHealthy = Object.values(services).every(s => s === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        gateway: 'healthy',
        services
    });
});

// ==================
// User Service Routes
// ==================
app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/users`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch users',
            details: error.message 
        });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch user',
            details: error.message 
        });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to create user',
            details: error.message 
        });
    }
});

// ====================
// Product Service Routes
// ====================
app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch product',
            details: error.message 
        });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const response = await axios.post(`${PRODUCT_SERVICE_URL}/products`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to create product',
            details: error.message 
        });
    }
});

// ===================
// Order Service Routes
// ===================
app.get('/api/orders', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch orders',
            details: error.message 
        });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch order',
            details: error.message 
        });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to create order',
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`User Service: ${USER_SERVICE_URL}`);
    console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
    console.log(`Order Service: ${ORDER_SERVICE_URL}`);
});
