-- =============================================
-- JAMALBRICO - Complete MySQL Database Export
-- Hardware & Household Goods Store Management
-- Compatible with XAMPP/MySQL/MariaDB
-- =============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jamalbrico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jamalbrico;

-- Drop existing tables in correct order (reverse dependency order)
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;

-- =============================================
-- TABLE: suppliers
-- =============================================
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_suppliers_name (name)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: customers
-- =============================================
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    customer_type ENUM('retail', 'wholesale', 'commercial') DEFAULT 'retail',
    credit_limit DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_customers_name (name),
    INDEX idx_customers_email (email)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: products
-- =============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) DEFAULT 0 CHECK (cost >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INT DEFAULT 5,
    max_stock_level INT DEFAULT 100,
    unit VARCHAR(50) DEFAULT 'unité',
    supplier_id INT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    INDEX idx_products_category (category),
    INDEX idx_products_sku (sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_stock (stock_quantity)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: sales
-- =============================================
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_number VARCHAR(100) UNIQUE,
    date DATE NOT NULL,
    customer_id INT,
    product_id INT,
    productName VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    category VARCHAR(100) NOT NULL,
    totalPrice DECIMAL(12,2) NOT NULL CHECK (totalPrice > 0),
    discount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('cash', 'credit', 'check', 'bank_transfer') DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sales_date (date),
    INDEX idx_sales_category (category),
    INDEX idx_sales_product_name (productName),
    INDEX idx_sales_customer (customer_id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: purchase_orders
-- =============================================
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    received_date DATE,
    status ENUM('pending', 'ordered', 'partial', 'received', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: purchase_order_items
-- =============================================
CREATE TABLE purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost DECIMAL(12,2) NOT NULL CHECK (total_cost >= 0),
    received_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: stock_movements
-- =============================================
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'adjustment'
    reference_id INT, -- sale_id, purchase_order_id, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_stock_movements_product (product_id),
    INDEX idx_stock_movements_type (movement_type)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, city, postal_code, payment_terms, notes) VALUES
('Outillage Pro Distribution Maroc', 'Ahmed Bennani', 'ahmed@outillagepro.ma', '+212-5-22-85-90-15', '45 Rue de l\'Industrie', 'Casablanca', '20250', 'Net 30', 'Fournisseur principal d\'outillage professionnel'),
('Stanley Maroc SARL', 'Fatima El Alaoui', 'fatima@stanley.ma', '+212-5-37-76-43-21', '78 Avenue des Outils', 'Rabat', '10080', 'Net 45', 'Outillage de qualité, outils manuels et électriques'),
('Ménage & Entretien Maroc', 'Youssef Tazi', 'youssef@menage-ma.ma', '+212-5-24-18-67-89', '123 Boulevard du Nettoyage', 'Marrakech', '40000', 'Net 30', 'Produits d\'entretien et articles ménagers'),
('Matériaux Bâtiment Maroc', 'Khadija Idrissi', 'khadija@materiaux-ma.ma', '+212-5-39-32-89-45', '56 Zone Industrielle Tanger', 'Tanger', '90000', 'Net 15', 'Matériaux de construction et fixations');

-- Insert customers
INSERT INTO customers (name, email, phone, address, city, postal_code, customer_type, credit_limit, notes) VALUES
('Mohammed Alami', 'mohammed.alami@email.ma', '+212-6-78-45-12-89', '15 Rue des Palmiers', 'Casablanca', '20200', 'retail', 5000, 'Client régulier, préfère paiement espèces'),
('Entreprise Bâtiment Fassi', 'contact@batiment-fassi.ma', '+212-5-35-67-89-23', '34 Zone Industrielle Fès', 'Fès', '30000', 'wholesale', 80000, 'Entreprise de construction, commandes en gros'),
('Aicha Benali', 'aicha.benali@email.ma', '+212-6-23-45-67-89', '78 Avenue Hassan II', 'Rabat', '10090', 'retail', 12000, 'Passionnée de bricolage, achats fréquents'),
('Services Maintenance Atlas', 'commandes@maintenance-atlas.ma', '+212-5-24-78-90-12', '12 Rue de la Réparation', 'Marrakech', '40100', 'commercial', 45000, 'Société de maintenance immobilière'),
('Hassan Berrada', 'hassan.berrada@email.ma', '+212-6-89-12-34-56', '67 Avenue du Maghreb', 'Agadir', '80000', 'retail', 8000, 'Projets de rénovation maison, week-ends');

-- Insert products
INSERT INTO products (name, description, sku, barcode, category, price, cost, stock_quantity, min_stock_level, max_stock_level, unit, supplier_id) VALUES
('Perceuse Visseuse Sans Fil 18V', 'Perceuse professionnelle avec batterie lithium', 'OUT-PER-18V-001', '6159119078453', 'Outillage Électrique', 899.00, 650.00, 24, 5, 50, 'unité', 2),
('Marteau à Panne Fendue 450g', 'Marteau professionnel avec manche fibre de verre', 'OUT-MAR-450G', '6159119078460', 'Outillage Manuel', 249.00, 125.00, 40, 10, 100, 'unité', 2),
('Vis à Bois 4x50mm Tête Phillips (100pcs)', 'Vis à bois zinguées, tête cruciforme Phillips', 'VIS-4X50-PH-100', '6159119078477', 'Visserie & Boulonnerie', 129.00, 62.50, 117, 20, 200, 'boîte', 4),
('Dégraissant Multi-Surfaces 750ml', 'Nettoyant dégraissant, parfum citron', 'ENT-DEG-750ML', '6159119078484', 'Produits d\'Entretien', 69.90, 31.00, 78, 15, 150, 'flacon', 3),
('Pinceau Rond Soies Naturelles Set 3pcs', 'Jeu pinceaux ronds, soies naturelles, tailles 6-10-14', 'PNT-RND-SET3', '6159119078491', 'Peinture & Décoration', 199.00, 87.50, 34, 8, 75, 'set', 1),
('Projecteur LED Chantier 30W', 'Lampe de travail LED portable avec support', 'ECL-LED-30W-CHT', '6159119078508', 'Éclairage', 459.00, 280.00, 16, 5, 40, 'unité', 1),
('Adhésif Toilé Argent 50mm x 25m', 'Ruban adhésif toilé renforcé, résistant', 'ADH-TOILE-50-25', '6159119078515', 'Adhésifs & Colles', 129.00, 65.00, 61, 12, 120, 'rouleau', 1),
('Lunettes Protection Transparentes', 'Lunettes sécurité anti-buée, norme EN 166', 'SEC-LUN-TRANS', '6159119078522', 'Équipement de Sécurité', 89.90, 32.50, 89, 20, 150, 'paire', 2),
('Mortier Prompt 25kg', 'Mortier à prise rapide pour scellements', 'MAT-MRT-25KG', '6159119078539', 'Matériaux de Construction', 189.00, 127.50, 45, 10, 100, 'sac', 4),
('Papier Toilette 12 Rouleaux Triple', 'Papier hygiénique 3 plis, extra doux', 'HYG-PQ-12RL-3P', '6159119078546', 'Articles Ménagers', 149.00, 82.50, 74, 15, 120, 'paquet', 3),
('Clé à Molette 250mm', 'Clé anglaise ajustable, ouverture max 30mm', 'OUT-CLE-MOL-250', '6159119078553', 'Outillage Manuel', 169.00, 95.00, 30, 8, 60, 'unité', 2),
('Chevilles Nylon 6x30mm (50pcs)', 'Chevilles expansion nylon pour fixation légère', 'FIX-CHV-6X30-50', '6159119078560', 'Visserie & Boulonnerie', 79.90, 42.00, 87, 20, 150, 'boîte', 4),
('Liquide Vaisselle Concentré 1L', 'Produit vaisselle dégraissant concentré', 'ENT-LV-CONC-1L', '6159119078577', 'Produits d\'Entretien', 39.90, 18.00, 102, 25, 200, 'flacon', 3),
('Rouleau Peinture Antigoutte 180mm', 'Rouleau mousse haute densité, finition parfaite', 'PNT-ROU-180-AG', '6159119078584', 'Peinture & Décoration', 89.90, 45.00, 37, 10, 80, 'unité', 1),
('Ampoule LED E27 9W Blanc Chaud', 'Ampoule LED économique, culot E27, 2700K', 'ECL-LED-E27-9W', '6159119078591', 'Éclairage', 59.90, 28.00, 80, 20, 150, 'unité', 1);

-- Insert sales transactions
INSERT INTO sales (sale_number, date, customer_id, product_id, productName, price, quantity, category, totalPrice, payment_method) VALUES
('VENTE-2024-0001', '2024-09-10', 1, 1, 'Perceuse Visseuse Sans Fil 18V', 899.00, 1, 'Outillage Électrique', 899.00, 'cash'),
('VENTE-2024-0002', '2024-09-10', 2, 2, 'Marteau à Panne Fendue 450g', 249.00, 5, 'Outillage Manuel', 1245.00, 'credit'),
('VENTE-2024-0003', '2024-09-11', 3, 3, 'Vis à Bois 4x50mm Tête Phillips (100pcs)', 129.00, 3, 'Visserie & Boulonnerie', 387.00, 'cash'),
('VENTE-2024-0004', '2024-09-11', 1, 4, 'Dégraissant Multi-Surfaces 750ml', 69.90, 2, 'Produits d\'Entretien', 139.80, 'cash'),
('VENTE-2024-0005', '2024-09-12', 4, 5, 'Pinceau Rond Soies Naturelles Set 3pcs', 199.00, 1, 'Peinture & Décoration', 199.00, 'check'),
('VENTE-2024-0006', '2024-09-12', 2, 6, 'Projecteur LED Chantier 30W', 459.00, 2, 'Éclairage', 918.00, 'credit'),
('VENTE-2024-0007', '2024-09-13', 5, 7, 'Adhésif Toilé Argent 50mm x 25m', 129.00, 4, 'Adhésifs & Colles', 516.00, 'cash'),
('VENTE-2024-0008', '2024-09-13', 3, 8, 'Lunettes Protection Transparentes', 89.90, 6, 'Équipement de Sécurité', 539.40, 'cash'),
('VENTE-2024-0009', '2024-09-14', 2, 9, 'Mortier Prompt 25kg', 189.00, 10, 'Matériaux de Construction', 1890.00, 'credit'),
('VENTE-2024-0010', '2024-09-14', 1, 10, 'Papier Toilette 12 Rouleaux Triple', 149.00, 1, 'Articles Ménagers', 149.00, 'cash'),
('VENTE-2024-0011', '2024-09-15', 4, 11, 'Clé à Molette 250mm', 169.00, 2, 'Outillage Manuel', 338.00, 'check'),
('VENTE-2024-0012', '2024-09-15', 5, 12, 'Chevilles Nylon 6x30mm (50pcs)', 79.90, 3, 'Visserie & Boulonnerie', 239.70, 'cash'),
('VENTE-2024-0013', '2024-09-16', 2, 13, 'Liquide Vaisselle Concentré 1L', 39.90, 8, 'Produits d\'Entretien', 319.20, 'credit'),
('VENTE-2024-0014', '2024-09-16', 3, 14, 'Rouleau Peinture Antigoutte 180mm', 89.90, 5, 'Peinture & Décoration', 449.50, 'cash'),
('VENTE-2024-0015', '2024-09-17', 1, 15, 'Ampoule LED E27 9W Blanc Chaud', 59.90, 5, 'Éclairage', 299.50, 'cash');

-- Insert stock movements for sales
INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id) VALUES
(1, 'out', 1, 'sale', 1), (2, 'out', 5, 'sale', 2), (3, 'out', 3, 'sale', 3),
(4, 'out', 2, 'sale', 4), (5, 'out', 1, 'sale', 5), (6, 'out', 2, 'sale', 6),
(7, 'out', 4, 'sale', 7), (8, 'out', 6, 'sale', 8), (9, 'out', 10, 'sale', 9),
(10, 'out', 1, 'sale', 10), (11, 'out', 2, 'sale', 11), (12, 'out', 3, 'sale', 12),
(13, 'out', 8, 'sale', 13), (14, 'out', 5, 'sale', 14), (15, 'out', 5, 'sale', 15);

-- Insert admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@jamalbrico.ma', 'hashed_password_here', 'Admin', 'JAMALBRICO', 'admin');

-- =============================================
-- FINAL STATISTICS
-- =============================================
SELECT 'Database Creation Complete!' as Status;
SELECT COUNT(*) as 'Total Suppliers' FROM suppliers;
SELECT COUNT(*) as 'Total Customers' FROM customers;
SELECT COUNT(*) as 'Total Products' FROM products;
SELECT COUNT(*) as 'Total Sales' FROM sales;
SELECT SUM(totalPrice) as 'Total Revenue (MAD)' FROM sales;
SELECT 'Ready for XAMPP Import!' as Notice;
