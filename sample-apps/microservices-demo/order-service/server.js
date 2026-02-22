const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/orders_db'
});

app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', service: 'order-service' });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

// Get all orders
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, 
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get order by ID
app.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );
        
        res.json({
            ...orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Create order
app.post('/orders', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { userId, items } = req.body;
        
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'userId and items array are required' });
        }
        
        // Verify user exists
        try {
            await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
        } catch {
            return res.status(400).json({ error: 'User not found' });
        }
        
        // Calculate total and verify products
        let totalAmount = 0;
        const orderItems = [];
        
        for (const item of items) {
            try {
                const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
                const product = productResponse.data;
                
                if (product.stock < item.quantity) {
                    return res.status(400).json({ 
                        error: `Insufficient stock for product ${product.name}` 
                    });
                }
                
                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;
                
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                });
            } catch {
                return res.status(400).json({ error: `Product ${item.productId} not found` });
            }
        }
        
        await client.query('BEGIN');
        
        // Create order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, totalAmount, 'pending']
        );
        
        const order = orderResult.rows[0];
        
        // Create order items
        for (const item of orderItems) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order.id, item.productId, item.quantity, item.price]
            );
            
            // Update product stock
            await axios.patch(`${PRODUCT_SERVICE_URL}/products/${item.productId}/stock`, {
                quantity: -item.quantity
            });
        }
        
        await client.query('COMMIT');
        
        // Fetch complete order with items
        const completeOrder = await pool.query(`
            SELECT o.*, 
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id
        `, [order.id]);
        
        res.status(201).json(completeOrder.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        client.release();
    }
});

// Update order status
app.patch('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Order Service running on port ${PORT}`);
});
