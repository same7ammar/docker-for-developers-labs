-- Initialize database schema
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO
    items (name)
VALUES
    ('Sample Item 1'),
    ('Sample Item 2'),
    ('Sample Item 3');