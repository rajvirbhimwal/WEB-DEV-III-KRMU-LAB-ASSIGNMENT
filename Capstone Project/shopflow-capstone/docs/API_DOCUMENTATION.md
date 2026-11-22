# ShopFlow REST API Documentation

Base URL: `http://localhost:5000/api`  
JSON format: `Content-Type: application/json`  
Protected endpoints: `Authorization: Bearer <accessToken>`

All successful responses use `success: true`; errors use `success: false`, `message`, and optional `details`.

## Authentication
### POST `/auth/register`
Public. Body:
```json
{"name":"Aarav Sharma","email":"aarav@example.com","password":"StrongPass123","phone":"9876543210"}
```
Creates customer only. Returns 201.

### POST `/auth/login`
Public. Body: `{"email":"customer@shopflow.demo","password":"Customer@12345"}`  
Returns `accessToken`, `refreshToken`, and safe user profile.

### POST `/auth/refresh`
Public. Body: `{"refreshToken":"<refresh-token>"}`  
Rotates refresh token; old token is revoked.

### POST `/auth/logout`
Authenticated. Body: `{"refreshToken":"<refresh-token>"}`  
Revokes the supplied refresh token.

### GET/PATCH `/auth/me`
Authenticated. PATCH accepts only `name` and `phone`.

## Categories
- `GET /categories` public.
- `POST /categories` admin; body `{ "name":"Home", "slug":"home", "description":"..." }`.
- `PATCH /categories/:id` admin.
- `DELETE /categories/:id` admin; soft-deactivates.

## Products
- `GET /products?page=1&limit=10&search=mouse&category=<id>&minPrice=100&maxPrice=2000&sort=price_asc`
- `GET /products/:id`
- `POST /products` seller/admin. Example:
```json
{"name":"USB-C Hub","description":"7-in-1 adapter","price":1299,"category":"<categoryId>","stock":20,"images":[]}
```
- `PATCH /products/:id` seller who owns it or admin. Allowed fields: name, description, price, category, stock, images, isActive.
- `DELETE /products/:id` seller owner/admin; soft-deactivates.

## Cart (customer)
- `GET /cart`
- `POST /cart/items` body `{ "productId":"<productId>", "quantity":2 }`
- `PATCH /cart/items/:productId` body `{ "quantity":3 }`
- `DELETE /cart/items/:productId`
- `DELETE /cart`

Cart totals are computed from current database prices.

## Orders
### POST `/orders/checkout`
Customer. Body:
```json
{
  "deliveryAddress": {
    "fullName":"Aarav Sharma","phone":"9876543210",
    "line1":"Sector 5","city":"Gurugram","state":"Haryana","postalCode":"122001"
  },
  "paymentMethod":"simulated_online"
}
```
Payment methods: `simulated_cod`, `simulated_online`. Response states payment is simulated. Client cannot send item prices or subtotal.

### GET `/orders/mine`
Customer's own order history.

### GET `/orders/:id`
Customer who owns it, seller whose product is in it, or admin.

### PATCH `/orders/:id/status`
Customer/Seller/Admin. Body `{ "status":"confirmed", "note":"Order accepted" }`. Customers may only cancel their own eligible order; sellers may update orders containing their products; admins may update any order. Valid transitions:
- placed → confirmed or cancelled
- confirmed → packed or cancelled
- packed → shipped
- shipped → delivered
- delivered/cancelled → no further transitions

## Admin reports
- `GET /reports/sales?from=2026-01-01&to=2026-12-31`
- `GET /reports/best-sellers?limit=10`
- `GET /reports/inventory`

## HTTP status codes
- 200 success
- 201 created
- 400 malformed input, validation or invalid state transition
- 401 missing/invalid/expired authentication
- 403 authenticated but role/ownership is insufficient
- 404 route/resource not found
- 409 duplicate or stock conflict
- 500 unexpected server error
## Socket.IO Real-Time Events

Connection:
- Connect to `http://localhost:5000`.
- Authentication uses a valid JWT access token.
- Pass the token through the Socket.IO auth object.

Example:
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "YOUR_ACCESS_TOKEN" }
});