-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jamalbrico;
USE jamalbrico;

-- Drop table if exists (for development)
DROP TABLE IF EXISTS sales;

-- Create sales table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    productName VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for better performance
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_product_name (productName)
);

-- Add some constraints
ALTER TABLE sales ADD CONSTRAINT chk_price CHECK (price > 0);
ALTER TABLE sales ADD CONSTRAINT chk_quantity CHECK (quantity > 0);
ALTER TABLE sales ADD CONSTRAINT chk_total_price CHECK (totalPrice > 0);
