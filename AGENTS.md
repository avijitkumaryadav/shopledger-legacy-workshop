# ShopLedger

## Stack

- Node.js with CommonJS modules.
- Express 4 serves the API and the static browser app; `body-parser` parses JSON request bodies.
- Persistence is a local JSON file at `data/db.json`, accessed through `lib/store.js`.
- The browser app is plain HTML, CSS, and JavaScript under `public/`.

## Module map

- `server.js`, `config.js`: application setup, route mounting, and configuration.
- `routes/`: Express endpoints for products, orders, customers, and reports/pricing.
- `lib/`: business logic for orders, inventory, pricing, coupons, tax, invoices, dates, reports, the customer ledger, and JSON storage.
- `public/`: browser UI assets.
- `data/db.json`: local application data.

## Commands

- `npm start`: run the server (`node server.js`).
- `npm test`: currently a placeholder that exits with an error; no test suite is configured.

## Rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests must never touch `data/db.json`.
- Add no dependencies.
