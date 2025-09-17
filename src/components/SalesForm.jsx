import { useState } from 'react';

const SalesForm = ({ onSaleAdded, editingSale, onEditComplete }) => {
  const [formData, setFormData] = useState({
    date: editingSale?.date || new Date().toISOString().split('T')[0],
    productName: editingSale?.productName || '',
    price: editingSale?.price || '',
    quantity: editingSale?.quantity || '',
    category: editingSale?.category || '',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Outils manuels',
    'Outils électriques',
    'Quincaillerie',
    'Plomberie',
    'Électricité',
    'Peinture & Décoration',
    'Jardinage',
    'Ménage & Entretien',
    'Sécurité',
    'Autre'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const totalPrice = Number.parseFloat(formData.price) * Number.parseInt(formData.quantity);

    const saleData = {
      ...formData,
      price: Number.parseFloat(formData.price),
      quantity: Number.parseInt(formData.quantity),
      totalPrice
    };

    try {
      if (editingSale) {
        // Update existing sale
        const response = await fetch(`http://localhost:3001/api/sales/${editingSale.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData)
        });

        if (response.ok) {
          if (onEditComplete) onEditComplete();
          resetForm();
        } else {
          throw new Error('Failed to update sale');
        }
      } else {
        // Add new sale
        const response = await fetch('http://localhost:3001/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData)
        });

        if (response.ok) {
          if (onSaleAdded) onSaleAdded(saleData);
          resetForm();
        } else {
          throw new Error('Failed to create sale');
        }
      }
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      productName: '',
      price: '',
      quantity: '',
      category: '',
    });
    setErrors({});
  };

  const totalPrice = formData.price && formData.quantity
    ? (Number.parseFloat(formData.price) * Number.parseInt(formData.quantity)).toFixed(2)
    : '0.00';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {editingSale ? 'Edit Sale' : 'Add New Sale'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Nom du produit..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.productName && <p className="text-red-500 text-sm mt-1">{errors.productName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix (MAD)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00 MAD"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantité
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix Total
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white font-semibold">
              {totalPrice} MAD
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {editingSale ? 'Modifier la vente' : 'Ajouter une vente'}
          </button>

          {editingSale && (
            <button
              type="button"
              onClick={onEditComplete}
              className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 rounded-md transition-colors duration-200"
            >
              Annuler
            </button>
          )}

          <button
            type="button"
            onClick={resetForm}
            className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-md transition-colors duration-200"
          >
            Effacer
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
