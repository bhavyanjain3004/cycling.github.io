## Clarifying Questions

The original assignment specification leaves several implementation details open to interpretation. Before designing the solution, I identified the following questions. The assumptions made in response to these questions are documented in **ASSUMPTIONS.md**.

---

## Pricing & History

* Should old prices remain queryable for historical dates, or is only the current price relevant?
* Can a price update be backdated (e.g., specifying that a price change became effective several days prior to entry)?
* What happens if a part has no recorded price on the requested date should the system return an error or the nearest available price?

---

## Configuration Logic

* Can a salesperson select more than one part from the same category?
* Are all six categories mandatory for a valid configuration?
* Once a configuration is saved, can it be edited, or is it permanently locked?

---

## Users & Roles

* Is there a difference between who can view configurations and who can update prices? Should there be basic access control?

---

## Data & Scale

* Approximately how many parts are expected across all categories?
* Does the system need to handle multiple currencies, or is INR the only supported currency?

---

## User Experience

* Should an admin price update take effect immediately, or go through an approval workflow before becoming active?
