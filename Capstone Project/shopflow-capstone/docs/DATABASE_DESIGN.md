# Database Design

## Collections and purpose

### users
Stores customers, sellers and administrators. `password` is bcrypt-hashed and excluded from normal queries. `refreshTokens` stores SHA-256 hashes, not raw refresh tokens. Role enum: `customer`, `seller`, `admin`.

### categories
Stores product taxonomy. `name` and `slug` are unique. Deactivation uses `isActive=false` rather than hard deletion.

### products
Stores listing information and current inventory. References `category` and `seller`. `price` must be greater than zero; `stock` cannot be negative.

### carts
One cart per customer (`user` unique). Items reference products and store quantity. Prices are not stored in the cart; current price is fetched from Product during cart display/checkout.

### orders
Stores customer, delivery address, payment simulation metadata, status and immutable item snapshots. Each item stores product reference, seller reference, product name, unit price at purchase, quantity and line total. This preserves the amount even if the product price changes later.

## Relationships
- User 1 — 0..1 Cart
- User 1 — many Orders as customer
- User 1 — many Products as seller
- Category 1 — many Products
- Order 1 — many OrderItems (embedded subdocuments)
- Product 1 — many CartItems / OrderItems (referenced)

## Indexes
- `users.email`: unique index
- `users(role, createdAt)`: role-oriented user listing
- `categories.name`, `categories.slug`: unique indexes
- `products(name, description)`: text index for search
- `products(category, price, isActive)`: category and price filtering
- `products(seller, createdAt)`: seller inventory
- `orders.orderNumber`: unique index
- `orders(customer, createdAt)`: customer order history
- `orders(items.seller, status, createdAt)`: seller order filtering

## Aggregation pipelines
1. Sales summary: `$match` eligible orders → `$group` count/revenue/average → `$project`; a second pipeline groups by date.
2. Best sellers: `$match` → `$unwind items` → `$group` by product → `$sort` units sold → `$limit`.
3. Inventory: `$match active products` → `$group` by category → `$lookup categories` → `$unwind` → `$project`.

## Inventory consistency
Checkout uses `findOneAndUpdate` with filter `{ _id, isActive: true, stock: { $gte: requestedQuantity } }` and update `$inc: { stock: -requestedQuantity }`. MongoDB applies this single-document update atomically. The filter prevents overselling for each product. If a later item cannot be reserved or order persistence fails, previously decremented quantities are restored by compensating updates. For production, wrap the complete multi-product checkout in a MongoDB transaction on a replica set.
