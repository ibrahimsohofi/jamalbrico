import Sale from '../models/Sale.js';

// Get all sales with optional filters
export const getAllSales = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const sales = await Sale.getAll(filters);
    res.json(sales);
  } catch (error) {
    console.error('Error getting sales:', error);
    // Return empty array when database is not available
    res.json([]);
  }
};

// Get sale by ID
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.getById(id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error getting sale:', error);
    res.status(404).json({ error: 'Sale not found' });
  }
};

// Create new sale
export const createSale = async (req, res) => {
  try {
    const { date, productName, price, quantity, category } = req.body;

    // Validation
    if (!date || !productName || !price || !quantity || !category) {
      return res.status(400).json({
        error: 'Missing required fields: date, productName, price, quantity, category'
      });
    }

    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    // Calculate total price
    const totalPrice = parseFloat(price) * parseInt(quantity);

    const saleData = {
      date,
      productName: productName.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category.trim(),
      totalPrice
    };

    const newSale = await Sale.create(saleData);
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Database not available - sale not saved' });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, productName, price, quantity, category } = req.body;

    // Check if sale exists
    const existingSale = await Sale.getById(id);
    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Validation
    if (!date || !productName || !price || !quantity || !category) {
      return res.status(400).json({
        error: 'Missing required fields: date, productName, price, quantity, category'
      });
    }

    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({
        error: 'Price and quantity must be greater than 0'
      });
    }

    // Calculate total price
    const totalPrice = parseFloat(price) * parseInt(quantity);

    const saleData = {
      date,
      productName: productName.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category.trim(),
      totalPrice
    };

    const updatedSale = await Sale.update(id, saleData);
    res.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Database not available - sale not updated' });
  }
};

// Delete sale
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Sale.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Database not available - sale not deleted' });
  }
};

// Get sales statistics
export const getSalesStats = async (req, res) => {
  try {
    console.log('📊 Getting sales statistics...');

    const stats = await Sale.getStats();
    const topCategories = await Sale.getTopCategories(5);
    const recentSales = await Sale.getRecentSales(5);
    const dailyRevenue = await Sale.getDailyRevenue(7);

    const response = {
      ...stats,
      topCategories,
      recentSales,
      dailyRevenue
    };

    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting stats:', error);
    // Return empty stats when database is not available
    res.json({
      totalSales: 0,
      totalRevenue: 0,
      totalProducts: 0,
      averageSale: 0,
      topCategories: [],
      recentSales: [],
      dailyRevenue: []
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Sale.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    // Return empty array when database is not available
    res.json([]);
  }
};
