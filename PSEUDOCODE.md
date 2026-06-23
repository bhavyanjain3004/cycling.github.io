## Core Operations Pseudocode

This document outlines the logical flow of the three core operations that power the pricing engine: price versioning, configuration creation, and historical price calculation.

---

# 1. Update Part Price (SCD Type 2)

When a price changes, the existing record is not overwritten. Instead, the current record is closed and a new active record is created.

```text
FUNCTION UpdatePartPrice(partId, newPrice, effectiveDate)

    BEGIN TRANSACTION

    activePrice = FIND current active price
                  WHERE part_id = partId
                  AND effective_to IS NULL

    IF activePrice EXISTS

        IF effectiveDate <= activePrice.effective_from
            THROW Error

        UPDATE activePrice
        SET effective_to = effectiveDate

    INSERT new price record
        part_id = partId
        price = newPrice
        effective_from = effectiveDate
        effective_to = NULL

    COMMIT TRANSACTION

END FUNCTION
```

---

# 2. Create Configuration

A configuration must contain one part from every category. Current prices are locked at creation time.

```text
FUNCTION CreateConfiguration(selectedParts, customerId)

    BEGIN TRANSACTION

    CREATE configuration

    totalPrice = 0

    FOR EACH selectedPart

        activePrice = GET current active price

        IF no active price exists
            THROW Error

        totalPrice += activePrice

        INSERT configuration item
            part_id
            category_id
            locked_price = activePrice

    VALIDATE all required categories exist

    UPDATE configuration
        cached_total = totalPrice

    COMMIT TRANSACTION

    RETURN configurationId, totalPrice

END FUNCTION
```

---

# 3. Calculate Historical Configuration Price

Reconstruct the configuration price using the price that was active on the requested date.

```text
FUNCTION GetHistoricalConfigurationPrice(configurationId, targetDate)

    parts = GET all parts in configuration

    totalPrice = 0
    breakdown = []

    FOR EACH part

        historicalPrice = FIND price
                          WHERE effective_from <= targetDate
                          AND (
                               effective_to > targetDate
                               OR effective_to IS NULL
                              )

        IF historicalPrice DOES NOT EXIST
            THROW Error

        totalPrice += historicalPrice

        ADD item to breakdown

    RETURN totalPrice, breakdown

END FUNCTION
```

---

## Key Principles

* Historical prices are never overwritten.
* Every price change creates a new version.
* Saved configurations are immutable.
* Historical quotes are reconstructed using point-in-time pricing.
* Missing historical prices cause the calculation to fail rather than return inaccurate totals.
