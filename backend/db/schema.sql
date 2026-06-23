-- Categories: The slots required for a bike
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- Parts: The actual inventory items
CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- PartPrices: SCD Type 2 table tracking historical pricing
CREATE TABLE IF NOT EXISTS part_prices (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    effective_from DATETIME NOT NULL,
    effective_to DATETIME, -- NULL means it's the current active price
    FOREIGN KEY(part_id) REFERENCES parts(id),
    CONSTRAINT check_price_dates CHECK (effective_from < effective_to)
);

-- Configurations: A saved quote or build
CREATE TABLE IF NOT EXISTS configurations (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cached_total REAL
);

-- ConfigurationItems: The parts selected in a build
CREATE TABLE IF NOT EXISTS configuration_items (
    id TEXT PRIMARY KEY,
    configuration_id TEXT NOT NULL,
    part_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    locked_price REAL NOT NULL,
    FOREIGN KEY(configuration_id) REFERENCES configurations(id),
    FOREIGN KEY(part_id) REFERENCES parts(id),
    FOREIGN KEY(category_id) REFERENCES categories(id),
    CONSTRAINT unique_category_per_config UNIQUE (configuration_id, category_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_part_prices_active ON part_prices (part_id) WHERE effective_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_config_items_config_id ON configuration_items (configuration_id);
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON parts (category_id);
