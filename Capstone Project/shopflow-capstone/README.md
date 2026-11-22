# ShopFlow — E-Commerce and Inventory Management System

A backend-focused capstone project built with Node.js, Express.js, MongoDB, Mongoose, JWT and Socket.IO. It supports customer, seller and administrator workflows.

## 1. Features
- Customer/seller/admin roles with backend-enforced RBAC.
- Customer registration, login, bcrypt password hashing, short-lived access JWTs and rotating refresh tokens.
- Product and category CRUD, text search, filtering, sorting and pagination.
- Customer cart with quantity validation and server-side pricing.
- Checkout creates a price-snapshotted order and atomically decrements each product's stock using MongoDB conditional `$inc` operations (`stock >= quantity`).
- Stock restoration when an eligible order is cancelled.
- Order status workflow: placed → confirmed → packed → shipped → delivered; customer/admin cancellation is allowed from placed/confirmed.
- Simulated payment only. No card/bank details are collected.
- Admin sales, best-selling-product and inventory aggregation reports.
- EventEmitter internal `order:placed` event and authenticated Socket.IO order notifications.
- Centralized errors, request logging, Helmet, CORS, compression and rate limiting.

## 2. Requirements
- Node.js 18+ (Node 20 LTS recommended)
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- Postman (or equivalent)

## 3. Installation
```bash
npm install
```
Copy `.env.example` to `.env` and configure `MONGODB_URI`, JWT secrets and port. Never commit `.env`.

```bash
npm run seed
npm run dev
```
API base URL: `http://localhost:5000/api`  
Health check: `GET http://localhost:5000/api/health`

## 4. Demo accounts
The seed script resets the project collections before inserting demo records. Run it only on a development database.

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopflow.demo | Admin@12345 |
| Seller | seller@shopflow.demo | Seller@12345 |
| Customer | customer@shopflow.demo | Customer@12345 |

Login using `POST /api/auth/login`. Use the returned access token as `Authorization: Bearer <accessToken>`. Keep the refresh token private.

## 5. Main API routes
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Register customer |
| POST | /auth/login | Public | Login |
| POST | /auth/refresh | Public + refresh token | Rotate tokens |
| POST | /auth/logout | Authenticated | Revoke supplied refresh token |
| GET/PATCH | /auth/me | Authenticated | View/update own profile |
| GET | /categories | Public | List active categories |
| POST/PATCH/DELETE | /categories[/:id] | Admin | Category management |
| GET | /products | Public | Search/filter/sort/paginate |
| GET | /products/:id | Public | Product details |
| POST/PATCH/DELETE | /products[/:id] | Seller/Admin | Product management |
| GET | /cart | Customer | View cart |
| POST | /cart/items | Customer | Add item |
| PATCH/DELETE | /cart/items/:productId | Customer | Update/remove item |
| DELETE | /cart | Customer | Clear cart |
| POST | /orders/checkout | Customer | Place order |
| GET | /orders/mine | Customer | Own order history |
| GET | /orders/:id | Owner seller/customer or Admin | Order details |
| PATCH | /orders/:id/status | Seller/Admin | Update permitted status |
| GET | /reports/sales | Admin | Sales summary and daily trend |
| GET | /reports/best-sellers | Admin | Best sellers |
| GET | /reports/inventory | Admin | Inventory summary |

See `docs/API_DOCUMENTATION.md` for request/response examples and `postman/ShopFlow.postman_collection.json` for importable requests.

## 6. Socket.IO
Connect to `http://localhost:5000` with:
```js
const socket = io("http://localhost:5000", {
  auth: { token: accessToken }
});
```
Events:
- Server → client `socket:ready`: `{ userId }`
- Server → customer `order:updated`: `{ orderId, orderNumber, status }`
- Server → seller `seller:new-order`: `{ orderId, orderNumber }`\n- Server → seller `seller:stock-low`: `{ productId, remaining }`

Only authenticated sockets connect. Each user joins a private `user:<id>` room and a role room.

## 7. Database design
Collections: `users`, `categories`, `products`, `carts`, `orders`.
References:
- Product → Category and User (seller)
- Cart → User and Product items
- Order → User (customer), Product and User (seller) in immutable order-item snapshots

Indexes include unique email/category slug/order number, product text search, category-price-active product filtering, seller-created product listing, and customer/seller order queries. See `docs/DATABASE_DESIGN.md`.

## 8. Important implementation notes
- Checkout does not trust client-supplied prices or totals. It reads current product prices from MongoDB.
- Stock decrement is atomic per product: the update matches only if enough stock exists. If a later item/order insert fails, previously reserved stock is compensated back.
- For a production deployment with replica-set MongoDB, use a multi-document transaction for all-or-nothing checkout. This coursework implementation deliberately uses conditional atomic updates and compensating restoration so it also runs on a standalone local MongoDB installation.
- Payment is explicitly simulated. It is not a real payment gateway.
- This is an educational baseline; production deployment additionally needs email verification, password reset, audit logging, stricter schema validation, monitoring and a hardened refresh-token/device policy.

## 9. Test plan
Import the Postman collection, set `baseUrl`, login as the relevant seeded role and run positive and negative cases. The collection stores access tokens automatically after login. Test:
1. Public product list succeeds.
2. Missing registration fields returns 400.
3. Customer cannot create a product (403).
4. Missing/invalid bearer token returns 401.
5. Seller can create and update own product.
6. Seller cannot modify another seller's product.
7. Customer adds product and checks out.
8. Stock reduces; insufficient stock is rejected without negative inventory.
9. Customer sees only own orders.
10. Invalid order status transition returns 400.
11. Admin-only aggregation routes reject non-admin users.
12. Authenticated Socket.IO receives order events.

## 10. Suggested demo sequence
1. Health check and show MongoDB seeded records.
2. Login as seller; create a product.
3. Login as customer; browse, add product to cart and checkout using simulated payment.
4. Show order response and reduced stock.
5. Update order status as seller; show customer real-time `order:updated` event.
6. Login as admin; show `/reports/sales`, `/reports/best-sellers`, `/reports/inventory`.
7. Demonstrate 401 and 403 cases in Postman.

## 11. Run tests
```bash
npm test
```
The included automated test checks the health endpoint. Most business-rule cases are provided in the Postman collection for end-to-end demonstration against MongoDB.
