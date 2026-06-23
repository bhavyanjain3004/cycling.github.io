# Hero Cycles Configurator
Hero Cycles sells thousands of different bicycle configurations. Part prices change every few months — a tyre that costs ₹200 in January might be ₹230 by December. This tool replaces the Excel-based process with something the sales team can actually use: build a configuration, get a full price breakdown instantly, and look up what that same configuration would have cost on any past date.

Frontend: https://cycling-rho.vercel.app  
Backend: https://hero-cycles-backend.onrender.com

> Note: The backend is on Render's free tier and spins down after inactivity. The first request may take 30–50 seconds to respond.

## Tech Stack

### Frontend

* React 19
* React Router v7
* Tailwind CSS v4
* Vite

### Backend

* Node.js
* Express v5
* better-sqlite3

---

## Setup

Clone the repository:

```bash
git clone https://github.com/bhavyanjain3004/cycling.github.io.git
cd cycling
```

### Frontend Setup

```bash
npm install
```

### Backend Setup

```bash
cd backend
npm install
npm run seed
```

The seed command creates the SQLite database and populates it with categories, parts, and initial pricing data. Run this command once before starting the backend server.

---

## Running Locally

Open two terminal windows.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:3001
```

### Terminal 2 — Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Endpoints

Base URL:

```text
http://localhost:3001
```

| Method | Endpoint                                        | Description                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/health`                                       | Check server health                               |
| GET    | `/api/catalog`                                  | Retrieve all parts with active prices             |
| GET    | `/api/parts/:id/prices`                         | Retrieve price history for a part                 |
| POST   | `/api/parts/:id/price`                          | Create a new price version for a part             |
| POST   | `/api/configurations`                           | Save a new cycle configuration                    |
| GET    | `/api/configurations/:id`                       | Retrieve a saved configuration                    |
| GET    | `/api/configurations/:id/price?date=YYYY-MM-DD` | Calculate configuration price for a specific date |

---

## Running Tests

```bash
cd backend
npm test
```

---

## Design Decisions

### Why SCD Type 2 for Price History?

Overwriting prices would make historical quotations unreliable. If a salesperson creates a quote today and needs to revisit it months later, the original prices should still be available. SCD Type 2 preserves historical pricing by storing validity periods for each price record, enabling accurate point-in-time calculations.

### Why Fail Fast on Missing Prices?

If a part does not have a valid price for the requested date, the API throws an error instead of returning a partial total. Returning incomplete pricing could lead to inaccurate quotations and business mistakes. Explicit failures are safer and easier to diagnose.

### Why Store `locked_price` on Configuration Items?

When a configuration is saved, the active price of each selected part is stored alongside the configuration. This guarantees that saved quotations remain consistent even if future price updates occur.

### Why SQLite Instead of PostgreSQL?

SQLite provides a lightweight setup requiring no separate database service, making it ideal for a take-home assignment and local development. The primary limitation is that Render's free tier does not persist SQLite files across instance restarts. In a production environment, PostgreSQL would be preferable for durability, concurrency, and advanced database features.

