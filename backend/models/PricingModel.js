import db from '../db/database.js';
import crypto from 'crypto';

class PricingModel {
  static getActivePrices(targetDate = new Date().toISOString()) {
    // Returns the active price for all parts on a specific date
    const stmt = db.prepare(`
      SELECT 
        p.id as part_id,
        p.name as part_name,
        p.sku,
        c.code as category_code,
        c.name as category_name,
        pp.price
      FROM parts p
      JOIN categories c ON p.category_id = c.id
      JOIN part_prices pp ON pp.part_id = p.id
      WHERE pp.effective_from <= ? 
        AND (pp.effective_to > ? OR pp.effective_to IS NULL)
    `);
    
    return stmt.all(targetDate, targetDate);
  }
  static getEffectivePrice(partId, targetDate) {
    const stmt = db.prepare(`
      SELECT price, effective_from, effective_to
      FROM part_prices
      WHERE part_id = ?
        AND effective_from <= ?
        AND (effective_to > ? OR effective_to IS NULL)
      ORDER BY effective_from DESC
      LIMIT 1
    `);
    
    // SQLite uses .get() to fetch a single row
    return stmt.get(partId, targetDate, targetDate);
  }

  static getPartPriceHistory(partId) {
    const stmt = db.prepare(`
      SELECT price, effective_from, effective_to
      FROM part_prices
      WHERE part_id = ?
      ORDER BY effective_from DESC
    `);
    
    return stmt.all(partId);
  }

  static updatePartPrice(partId, newPrice, effectiveFrom) {
    const updateTransaction = db.transaction(() => {
      // 1. Find the currently active price
      const current = db.prepare(`
        SELECT id, effective_from
        FROM part_prices
        WHERE part_id = ? AND effective_to IS NULL
      `).get(partId);

      // 2. If an active price exists, close it off.
      if (current) {
        if (new Date(effectiveFrom) <= new Date(current.effective_from)) {
          throw new Error('Cannot backdate a price before the current active price start date.');
        }

        // We set effective_to exactly to effectiveFrom. 
        // Because getEffectivePrice() uses (effective_to > targetDate), 
        // this naturally avoids overlaps without creating 1-day gaps!
        // (If we literally subtracted 1 day, any queries matching that 24-hour gap would fail to find a price).
        db.prepare(`
          UPDATE part_prices
          SET effective_to = ?
          WHERE id = ?
        `).run(effectiveFrom, current.id);
      }

      // 3. Insert the new historical price row (without deleting the old one!)
      db.prepare(`
        INSERT INTO part_prices (id, part_id, price, effective_from, effective_to)
        VALUES (?, ?, ?, ?, NULL)
      `).run(crypto.randomUUID(), partId, newPrice, effectiveFrom);
    });

    updateTransaction();
  }

  static getConfigurationPriceBreakdown(configId, targetDate = new Date().toISOString()) {
    // 1. Fetch the parts in this configuration
    const itemsStmt = db.prepare(`
      SELECT 
        ci.part_id, 
        p.name as part_name, 
        c.name as category_name
      FROM configuration_items ci
      JOIN parts p ON ci.part_id = p.id
      JOIN categories c ON ci.category_id = c.id
      WHERE ci.configuration_id = ?
    `);
    
    const items = itemsStmt.all(configId);
    
    let totalPrice = 0;
    const breakdown = [];

    // 2. Resolve historical price for each part
    for (const item of items) {
      const priceRecord = this.getEffectivePrice(item.part_id, targetDate);

      // Best Behavior: If a part has no active price on this date, the entire configuration 
      // quote is invalid. Returning a partial sum would be misleading and financially dangerous.
      // Therefore, we MUST throw an error explicitly stating which part is unpriced.
      if (!priceRecord) {
        throw new Error(`Cannot price configuration: Part '${item.part_name}' (${item.category_name}) has no active price on ${targetDate}.`);
      }

      totalPrice += priceRecord.price;
      
      breakdown.push({
        category: item.category_name,
        partName: item.part_name,
        priceUsed: priceRecord.price
      });
    }

    return {
      subtotal: totalPrice,
      totalPrice,
      breakdown
    };
  }

  static getConfiguration(configId) {
    const config = db.prepare('SELECT * FROM configurations WHERE id = ?').get(configId);
    if (!config) return null;
    const items = db.prepare(`
      SELECT ci.part_id, p.name as part_name, c.name as category_name, ci.locked_price
      FROM configuration_items ci
      JOIN parts p ON ci.part_id = p.id
      JOIN categories c ON ci.category_id = c.id
      WHERE ci.configuration_id = ?
    `).all(configId);
    return {
      id: config.id,
      customerId: config.customer_id,
      createdAt: config.created_at,
      subtotal: config.cached_total,
      totalPrice: config.cached_total,
      breakdown: items.map(item => ({
        category: item.category_name,
        partName: item.part_name,
        priceUsed: item.locked_price
      }))
    };
  }

  static getCategories() {
    const stmt = db.prepare('SELECT * FROM categories');
    return stmt.all();
  }


  static createConfiguration(partIds, customerId = 'guest') {
    const createTransaction = db.transaction(() => {
      const configId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Insert configuration
      db.prepare(`
        INSERT INTO configurations (id, customer_id, created_at, cached_total)
        VALUES (?, ?, ?, 0)
      `).run(configId, customerId, now);

      let total = 0;

      for (const partId of partIds) {
        const part = db.prepare(`
          SELECT p.category_id, pp.price
          FROM parts p
          JOIN part_prices pp ON pp.part_id = p.id
          WHERE p.id = ? AND pp.effective_to IS NULL
        `).get(partId);

        if (!part) {
          throw new Error(`Part '${partId}' not found or has no active price.`);
        }

        total += part.price;

        // SQLite UNIQUE constraint will throw an error if a category is duplicated
        db.prepare(`
          INSERT INTO configuration_items (id, configuration_id, part_id, category_id, locked_price)
          VALUES (?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), configId, partId, part.category_id, part.price);
      }

      // Check if all 6 categories are filled (optional business logic for a complete bike)
      // We will just let the frontend send whatever they want, or we can strictly enforce 6.
      // The prompt says "missing part for a category" as an invalid input example.
      const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
      if (partIds.length !== categoryCount) {
        throw new Error(`A complete configuration requires exactly ${categoryCount} parts (one from each category).`);
      }

      // Update cached total
      db.prepare(`
        UPDATE configurations SET cached_total = ? WHERE id = ?
      `).run(total, configId);

      return { configId, total };
    });

    return createTransaction();
  }
}

export default PricingModel;
