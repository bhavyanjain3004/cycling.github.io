import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function uuid() {
  return crypto.randomUUID();
}

console.log('Running database setup...');

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

try {
  // Drop tables if they exist to start fresh
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS configuration_items;
    DROP TABLE IF EXISTS configurations;
    DROP TABLE IF EXISTS part_prices;
    DROP TABLE IF EXISTS parts;
    DROP TABLE IF EXISTS categories;
    PRAGMA foreign_keys = ON;
  `);

  db.exec(schemaSql);
  console.log('Schema created successfully.');
} catch (err) {
  console.error('Error creating schema:', err);
  process.exit(1);
}

// Seed Data
const insertCategory = db.prepare('INSERT INTO categories (id, code, name) VALUES (?, ?, ?)');
const insertPart = db.prepare('INSERT INTO parts (id, category_id, sku, name) VALUES (?, ?, ?, ?)');
const insertPrice = db.prepare('INSERT INTO part_prices (id, part_id, price, effective_from, effective_to) VALUES (?, ?, ?, ?, ?)');

const categories = [
  { code: 'frame', name: 'Frame' },
  { code: 'gear_set', name: 'Gear Set' },
  { code: 'tyres', name: 'Tyres' },
  { code: 'brakes', name: 'Brakes' },
  { code: 'seat', name: 'Seat' },
  { code: 'handlebar', name: 'Handlebar' },
];

const now = new Date().toISOString();

db.transaction(() => {
  for (const cat of categories) {
    const catId = uuid();
    insertCategory.run(catId, cat.code, cat.name);

    // Create 2 parts per category
    for (let i = 1; i <= 2; i++) {
      const partId = uuid();
      insertPart.run(partId, catId, `${cat.code}-00${i}`, `${cat.name} Type ${i}`);

      const currentPrice = Math.floor(Math.random() * 5000) + 1000;

      // For the very first part, create a historical price to demonstrate SCD Type 2
      if (cat.code === 'frame' && i === 1) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        // The old price was 500 cheaper, active from 1 year ago until right now
        insertPrice.run(uuid(), partId, currentPrice - 500, oneYearAgo.toISOString(), now);
      }

      // Insert current active price
      insertPrice.run(uuid(), partId, currentPrice, now, null);
    }
  }
})();

console.log('Database seeded successfully with categories, parts, and initial prices.');
process.exit(0);
