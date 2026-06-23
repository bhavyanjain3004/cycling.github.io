import express from 'express';
import { 
  getCatalog,
  updatePartPrice,
  getPartPriceHistory,
  createConfiguration,
  getConfigurationPrice,
  getConfiguration
} from '../controllers/pricingController.js';

const router = express.Router();

// Get full catalog with active prices
router.get('/catalog', getCatalog);

// GET /parts/:id/prices
router.get('/parts/:id/prices', getPartPriceHistory);

// POST /parts/:id/price
router.post('/parts/:id/price', updatePartPrice);

// POST /configurations
router.post('/configurations', createConfiguration);

// GET /configurations/:id
router.get('/configurations/:id', getConfiguration);

// GET /configurations/:id/price?date=YYYY-MM-DD
router.get('/configurations/:id/price', getConfigurationPrice);

export default router;
