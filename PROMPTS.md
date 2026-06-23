## AI Usage Log

AI tools (Claude, and Gemini) were used as brainstorming assistants, code reviewers, and documentation helpers throughout the development process. Final architectural decisions, implementation, testing, and debugging were performed by me.

---

## 1. Historical Pricing Design

**Prompt**

```text
I am building a bicycle configuration system where part prices change over time. Users must be able to calculate what a configuration would have cost on a specific date in the past. What database design pattern would best support historical pricing?
```

**Outcome**

Used the response to evaluate different approaches and ultimately implemented an SCD Type 2 pricing model using `effective_from` and `effective_to` timestamps.

---

## 2. Historical Price Retrieval

**Prompt**

```text
What edge cases should be considered when querying historical price records using effective date ranges?
```

**Outcome**

Helped identify overlapping date ranges, missing historical prices, and boundary conditions when calculating point-in-time pricing.

---

## 3. Database Schema Review

**Prompt**

```text
Review this database schema for a pricing system that supports historical price tracking and immutable quotations. Are there any integrity constraints I should add?
```

**Outcome**

Used the feedback to validate foreign key relationships and enforce one component per category through database constraints.

---

## 4. React State Management

**Prompt**

```text
What is a clean React approach for managing a bicycle configuration where each category stores a selected part and updates independently?
```

**Outcome**

Used the response as a reference while implementing centralized configuration state management.

---

## 5. Code Review & Edge Cases

**Prompt**

```text
Review my price update workflow. What edge cases or data consistency issues should I verify before deployment?
```

**Outcome**

Used as a checklist to validate historical pricing behavior, date validation rules, and configuration integrity.

---

## 6. Documentation Assistance

**Prompt**

```text
Help structure README, assumptions, pseudocode, and design-decision documentation for a take-home engineering assignment.
```

**Outcome**

Used AI to improve clarity and organization of project documentation while ensuring all content accurately reflected the implemented solution.
