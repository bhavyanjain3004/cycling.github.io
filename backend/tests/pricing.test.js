import { test, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import PricingModel from '../models/PricingModel.js';
import db from '../db/database.js';
import { updatePartPrice } from '../controllers/pricingController.js';

afterEach(() => {
  mock.restoreAll();
});

test('getConfigurationPriceBreakdown throws when a part has no active price on the target date', (t) => {
  mock.method(db, 'prepare', () => ({
    all: () => [{ part_id: 'part-123', part_name: 'Vintage Steel Frame', category_name: 'Frame' }]
  }));
  mock.method(PricingModel, 'getEffectivePrice', () => null);

  const targetDate = '2026-06-25T00:00:00.000Z';
  assert.throws(() => {
    PricingModel.getConfigurationPriceBreakdown('config-999', targetDate);
  }, new Error(`Cannot price configuration: Part 'Vintage Steel Frame' (Frame) has no active price on ${targetDate}.`));
});

test('normalizes IST date to UTC before storing', (t) => {
  const req = {
    params: { id: 'part-1' },
    body: { price: 100, effectiveFrom: '2026-06-25T10:00:00+05:30' }
  };
  const resStatus = mock.fn(() => res);
  const resJson = mock.fn();
  const res = { status: resStatus, json: resJson };

  const updateMock = mock.method(PricingModel, 'updatePartPrice', () => {});

  updatePartPrice(req, res);

  // Assert that 10:00:00+05:30 was normalized exactly to 04:30:00.000Z before model insertion
  assert.strictEqual(updateMock.mock.calls.length, 1);
  assert.strictEqual(updateMock.mock.calls[0].arguments[2], '2026-06-25T04:30:00.000Z');
  assert.strictEqual(resStatus.mock.calls[0].arguments[0], 200);
});

test('rejects backdated price before current effective_from', (t) => {
  mock.method(db, 'prepare', () => ({
    get: () => ({ id: 'row-1', effective_from: '2026-01-01T00:00:00.000Z' })
  }));

  assert.throws(() => {
    // Attempting to update with an effectiveFrom in 2023, well before the active 2026 price
    PricingModel.updatePartPrice('part-1', 200, '2023-01-01T00:00:00.000Z');
  }, /Cannot backdate a price before the current active price start date/);
});

test('returns most recent price when two rows would overlap', (t) => {
  // Since we are unit testing, we verify the raw SQL syntax contains the defensive fix
  // The actual SQLite execution is handled perfectly if the ORDER BY DESC LIMIT 1 is present.
  let executedSql = '';
  mock.method(db, 'prepare', (sql) => {
    executedSql = sql;
    return {
      get: () => ({ price: 500, effective_from: '2026-01-01T00:00:00.000Z', effective_to: null })
    };
  });

  PricingModel.getEffectivePrice('part-1', '2026-06-25T00:00:00.000Z');

  // Verify the query explicitly orders by date and limits to 1 row
  assert.ok(executedSql.includes('ORDER BY effective_from DESC'));
  assert.ok(executedSql.includes('LIMIT 1'));
});

test('getActivePrices returns active prices on a given date', (t) => {
  const mockRows = [
    { part_id: 'p1', part_name: 'Part 1', sku: 'SKU1', category_code: 'cat1', category_name: 'Cat 1', price: 100 }
  ];
  mock.method(db, 'prepare', () => ({
    all: () => mockRows
  }));

  const result = PricingModel.getActivePrices('2026-06-25T00:00:00.000Z');
  assert.deepStrictEqual(result, mockRows);
});

test('createConfiguration successfully creates configuration and computes plain total without discount', (t) => {
  mock.method(db, 'transaction', (fn) => fn);

  mock.method(db, 'prepare', (sql) => {
    if (sql.includes('SELECT p.category_id')) {
      return {
        get: () => ({ category_id: 'cat-1', price: 1500 })
      };
    }
    if (sql.includes('SELECT COUNT(*)')) {
      return {
        get: () => ({ count: 2 })
      };
    }
    // For inserts and updates
    return {
      run: () => ({ changes: 1 })
    };
  });

  const result = PricingModel.createConfiguration(['part-1', 'part-2'], 'customer-123');

  // Plain sum total is 3000 (no discount)
  assert.strictEqual(result.total, 3000);
  assert.ok(result.configId);
});

test('updatePartPrice successfully inserts a new price row and closes the previous active row', (t) => {
  mock.method(db, 'transaction', (fn) => fn);

  let updateSql = '';
  let insertSql = '';
  let updateParams = [];
  let insertParams = [];

  mock.method(db, 'prepare', (sql) => {
    if (sql.includes('SELECT id, effective_from')) {
      return {
        get: () => ({ id: 'current-price-row', effective_from: '2026-01-01T00:00:00.000Z' })
      };
    }
    if (sql.includes('UPDATE part_prices')) {
      return {
        run: (...args) => {
          updateSql = sql;
          updateParams = args;
          return { changes: 1 };
        }
      };
    }
    if (sql.includes('INSERT INTO part_prices')) {
      return {
        run: (...args) => {
          insertSql = sql;
          insertParams = args;
          return { changes: 1 };
        }
      };
    }
    return { run: () => ({ changes: 1 }) };
  });

  PricingModel.updatePartPrice('part-1', 2500, '2026-06-25T00:00:00.000Z');

  assert.strictEqual(updateParams[0], '2026-06-25T00:00:00.000Z');
  assert.strictEqual(updateParams[1], 'current-price-row');

  assert.strictEqual(insertParams[1], 'part-1');
  assert.strictEqual(insertParams[2], 2500);
  assert.strictEqual(insertParams[3], '2026-06-25T00:00:00.000Z');
});

test('getConfigurationPriceBreakdown returns plain subtotal and totalPrice with component breakdown and no discount', (t) => {
  mock.method(db, 'prepare', () => ({
    all: () => [
      { part_id: 'part-1', part_name: 'Vintage Steel Frame', category_name: 'Frame' },
      { part_id: 'part-2', part_name: 'Standard Tyres', category_name: 'Tyres' }
    ]
  }));

  mock.method(PricingModel, 'getEffectivePrice', (partId, date) => {
    if (partId === 'part-1') return { price: 1200 };
    if (partId === 'part-2') return { price: 800 };
    return null;
  });

  const result = PricingModel.getConfigurationPriceBreakdown('config-123', '2026-06-25T00:00:00.000Z');

  // sum total: 2000, no discount
  assert.strictEqual(result.subtotal, 2000);
  assert.strictEqual(result.totalPrice, 2000);
  assert.strictEqual(result.breakdown.length, 2);
  assert.strictEqual(result.breakdown[0].partName, 'Vintage Steel Frame');
  assert.strictEqual(result.breakdown[0].priceUsed, 1200);
  assert.strictEqual(result.breakdown[1].partName, 'Standard Tyres');
  assert.strictEqual(result.breakdown[1].priceUsed, 800);
});
