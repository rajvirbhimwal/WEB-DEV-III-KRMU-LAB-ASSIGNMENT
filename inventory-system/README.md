# Inventory and Data Management System

Node.js + Express + MongoDB (Mongoose) REST API.

## Setup
1. Install and start MongoDB (or use a MongoDB Atlas URI).
2. `npm install`
3. Copy `.env.example` to `.env` and adjust `MONGO_URI` if needed.
4. (Optional) `npm run seed` to load 12 sample products.
5. `npm start` (server at http://localhost:5000)

## Endpoints
| Method | URL | Description |
|---|---|---|
| POST | /api/products | Create product |
| GET | /api/products | List (filter, sort, paginate) |
| GET | /api/products/:id | Get one product |
| PUT | /api/products/:id | Update product details |
| PATCH | /api/products/:id/stock | Body `{ "change": 10 }` restock, `{ "change": -3 }` sale |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/low-stock | Products where quantity <= reorderLevel |
| GET | /api/products/summary | Category-wise aggregation |

### Query parameters for GET /api/products
`category`, `supplier`, `search`, `minPrice`, `maxPrice`, `inStock=true|false`,
`sort` (e.g. `-price,name`), `page`, `limit`

Example: `/api/products?category=Electronics&minPrice=500&sort=-price&page=1&limit=5`

### Sample POST body
```json
{ "name": "Gel Pen Pack of 15", "sku": "STNY-PN-713", "category": "Stationery",
  "price": 120, "quantity": 40, "reorderLevel": 20, "supplier": "Cello Pens" }
```
