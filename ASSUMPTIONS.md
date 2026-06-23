## Pricing & History

### 1. Should old prices remain queryable for historical dates, or is only the current price relevant?

**Assumption:** Historical prices must remain queryable to support accurate quote generation and auditing.

**Implementation:** The system uses a Slowly Changing Dimension (SCD) Type 2 model in the `part_prices` table. Each price record contains `effective_from` and `effective_to` timestamps, ensuring historical prices are preserved instead of overwritten.

---

### 2. Can a price update be backdated?

**Assumption:** Price updates may be backdated, provided they do not invalidate existing historical records.

**Implementation:** An administrator may specify an `effectiveFrom` date in the past. Validation prevents the new date from creating overlapping price periods.

---

### 3. What happens if a part has no recorded price on the requested date?

**Assumption:** The system should fail fast rather than return incomplete or misleading pricing information.

**Implementation:** If no valid price exists for a requested date, the API returns an error and refuses to calculate the configuration total.

---

## Configuration Logic

### 4. Can a salesperson select more than one part from the same category?

**Assumption:** A bicycle configuration may contain only one part per category.

**Implementation:** This rule is enforced at the database level using a `UNIQUE(configuration_id, category_id)` constraint.

---

### 5. Are all six categories mandatory for a valid configuration?

**Assumption:** A valid bicycle configuration must contain one component from every category.

**Implementation:** The API validates that exactly one part from each required category is supplied before a configuration can be created.

---

### 6. Once a configuration is saved, can it be edited, or is it permanently locked?

**Assumption:** Saved configurations represent historical quotations and should remain immutable.

**Implementation:** The active price of each selected part is copied into the `locked_price` field when the configuration is created. Future price changes do not affect previously saved configurations.

---

## Users & Roles

### 7. Is there a difference between who can view configurations and who can update prices?

**Assumption:** The application operates within a trusted internal environment.

**Implementation:** Authentication and role-based access control are outside the scope of this assignment. All users have access to configuration and pricing functionality.

---

## Data & Scale

### 8. Approximately how many parts are expected across all categories?

**Assumption:** The catalog size is expected to remain within thousands to tens of thousands of parts.

**Implementation:** SQLite with `better-sqlite3` provides sufficient performance while keeping setup simple for reviewers. The schema can be migrated to PostgreSQL if future scale requires it.

---

### 9. Does the system need to handle multiple currencies, or is INR the only supported currency?

**Assumption:** The application operates using a single currency (INR).

**Implementation:** Prices are stored as numeric values without exchange-rate management or currency-conversion logic.

---

## User Experience

### 10. Should an admin price update take effect immediately, or go through an approval workflow?

**Assumption:** Price updates should become active immediately after submission.

**Implementation:** A successful `POST /api/parts/:id/price` request creates a new active price record that is immediately used in future configuration calculations.
