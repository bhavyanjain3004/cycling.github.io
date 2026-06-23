import PricingModel from '../models/PricingModel.js';

export const getCatalog = (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString();
    
    const categories = PricingModel.getCategories();
    const activePrices = PricingModel.getActivePrices(targetDate);

    // Group parts by category for the frontend
    const catalog = categories.map(cat => {
      return {
        ...cat,
        parts: activePrices.filter(p => p.category_code === cat.code).map(p => ({
          id: p.part_id,
          name: p.part_name,
          sku: p.sku,
          price: p.price
        }))
      };
    });

    res.json({
      date: targetDate,
      catalog
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const updatePartPrice = (req, res) => {
  try {
    const { id } = req.params;
    const { price, effectiveFrom } = req.body;

    if (price === undefined || price < 0) {
      return res.status(400).json({ error: 'Invalid price. Must be a positive number.' });
    }

    const dateStr = effectiveFrom || new Date().toISOString();
    if (isNaN(Date.parse(dateStr))) {
      return res.status(400).json({ error: 'Invalid date format for effectiveFrom' });
    }
    const normalizedDate = new Date(dateStr).toISOString();

    PricingModel.updatePartPrice(id, price, normalizedDate);
    res.status(200).json({ message: 'Price updated successfully' });
  } catch (error) {
    console.error('Error updating price:', error);
    
    if (error.message.includes('Cannot backdate a price')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPartPriceHistory = (req, res) => {
  try {
    const { id } = req.params;
    const history = PricingModel.getPartPriceHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createConfiguration = (req, res) => {
  try {
    const { partIds, customerId } = req.body;

    if (!Array.isArray(partIds) || partIds.length === 0) {
      return res.status(400).json({ error: 'partIds must be a non-empty array' });
    }

    const result = PricingModel.createConfiguration(partIds, customerId);
    res.status(201).json({ message: 'Configuration created', data: result });
  } catch (error) {
    console.error('Error creating configuration:', error);
    
    // Handle uniqueness constraints (duplicate category) and our custom errors
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A configuration can only contain one part per category.' });
    }
    
    if (error.message.includes('A complete configuration requires exactly') || error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getConfigurationPrice = (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    let targetDate = date;
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD or ISO 8601 string.' });
    }

    if (!targetDate) {
      targetDate = new Date().toISOString();
    } else {
      // Convert to strict ISO string so SQLite lexical compares work correctly
      targetDate = new Date(targetDate).toISOString();
    }

    const breakdown = PricingModel.getConfigurationPriceBreakdown(id, targetDate);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching configuration price:', error);
    
    if (error.message.includes('Cannot price configuration')) {
      return res.status(422).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getConfiguration = (req, res) => {
  try {
    const { id } = req.params;
    const config = PricingModel.getConfiguration(id);
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
