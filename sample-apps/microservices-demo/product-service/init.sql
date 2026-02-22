-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, description, price, stock) VALUES
    ('Laptop Pro', 'High-performance laptop with 16GB RAM', 1299.99, 50),
    ('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 29.99, 200),
    ('Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 149.99, 75),
    ('USB-C Hub', '7-in-1 USB-C hub with HDMI and SD card reader', 49.99, 150),
    ('Monitor 27"', '4K IPS monitor with HDR support', 399.99, 30);
