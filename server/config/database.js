import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jamalbrico',
  multipleStatements: true,
  charset: 'utf8mb4'
};

// Database connection pool
let pool = null;

const initializeDatabase = async () => {
  try {
    // First, try to create database if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();

    // Create connection pool to the specific database
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    console.log(`📁 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    connection.release();

    // Create tables if they don't exist
    await createTables();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure MySQL service is running and check your credentials in .env file');
    console.error('💡 To install MySQL on your system:');
    console.error('   - Linux: sudo apt install mysql-server');
    console.error('   - macOS: brew install mysql');
    console.error('   - Windows: Download from https://dev.mysql.com/downloads/mysql/');
  }
};

const createTables = async () => {
  try {
    // Check if tables exist
    const [rows] = await pool.execute("SHOW TABLES LIKE 'sales'");
    if (rows.length > 0) {
      console.log('✅ Database tables already exist');
      return;
    }

    console.log('🔄 Creating database tables...');

    // Suppliers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
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
      ) ENGINE=InnoDB
    `);

    // Customers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS customers (
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
      ) ENGINE=InnoDB
    `);

    // Products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
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
      ) ENGINE=InnoDB
    `);

    // Sales table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sales (
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
      ) ENGINE=InnoDB
    `);

    // Purchase orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
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
      ) ENGINE=InnoDB
    `);

    // Purchase order items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
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
      ) ENGINE=InnoDB
    `);

    // Stock movements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
        quantity INT NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_stock_movements_product (product_id),
        INDEX idx_stock_movements_type (movement_type)
      ) ENGINE=InnoDB
    `);

    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
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
      ) ENGINE=InnoDB
    `);

    console.log('✅ Database tables created successfully');

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
  }
};

// Database query helper functions for MySQL compatibility
const dbHelpers = {
  // Execute a query with parameters
  async execute(query, params = []) {
    if (!pool) {
      throw new Error('Database not connected');
    }
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Execute a query and return first row
  async get(query, params = []) {
    if (!pool) {
      throw new Error('Database not connected');
    }
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  },

  // Execute a query and return all rows
  async all(query, params = []) {
    if (!pool) {
      throw new Error('Database not connected');
    }
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Execute an insert/update/delete query
  async run(query, params = []) {
    if (!pool) {
      throw new Error('Database not connected');
    }
    const [result] = await pool.execute(query, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows,
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }
};

// Initialize database on module load
initializeDatabase();

// Export database helpers for MySQL operations
export default dbHelpers;

// Helper function to get database pool
export const getDatabase = () => dbHelpers;
export { pool };
