# Viva Preparation — ShopFlow

## Explain the request flow
A request enters Express through a route. Authentication middleware verifies the JWT and loads the active user. Authorization middleware checks the role. The controller validates business rules and calls the Mongoose model. Mongoose communicates with MongoDB, then the controller returns a consistent JSON response. Errors are passed to centralized error middleware.

## Common viva questions
**1. Why MongoDB?**  
It stores product, user and order documents flexibly. Mongoose adds schemas, validation, references and indexes.

**2. Why MVC/layered architecture?**  
Routes define endpoints, middleware handles cross-cutting concerns, controllers coordinate business logic, and models define database structures. This improves separation and maintainability.

**3. Why bcrypt?**  
It hashes passwords with a salt and is intentionally computationally expensive. Plain-text passwords are never stored.

**4. Access token vs refresh token?**  
The access token is short-lived and sent with protected requests. The refresh token is longer-lived and exchanged for a new access/refresh pair. The stored refresh-token hash permits revocation and rotation.

**5. What is RBAC?**  
Role-Based Access Control. Customer, seller and admin roles have different permissions, enforced on the server.

**6. How do you prevent overselling?**  
Checkout updates stock using a single atomic MongoDB operation whose filter includes `stock >= requestedQuantity`; if the condition fails, no decrement occurs.

**7. Why not trust cart totals from frontend?**  
A client can modify requests. The server reads current product prices and calculates subtotal itself.

**8. What is an aggregation pipeline?**  
A sequence of MongoDB stages that transforms documents. This project uses `$match`, `$group`, `$unwind`, `$lookup`, `$project`, `$sort` and `$limit` for reports.

**9. EventEmitter vs Socket.IO?**  
EventEmitter is internal to the Node.js process and decouples application events such as `order:placed`. Socket.IO communicates updates to connected clients in real time.

**10. Why simulated payment?**  
The assignment explicitly permits simulated payment and does not require real card/banking processing. The API labels it as simulated and collects no sensitive payment credentials.

**11. What is an index?**  
An index speeds up common queries at the cost of additional storage and write overhead. This project indexes email, product search/filter fields and order lookup fields.

**12. What is the limitation of compensating stock updates?**  
Each product decrement is atomic, but the complete multi-product operation is not a single cross-document transaction on a standalone MongoDB server. A replica-set transaction is preferable in production.

## Be ready to demonstrate
- Register/login and explain hashed password storage.
- Show 401 without token and 403 with insufficient role.
- Add product as seller; attempt to update a product owned by another seller if a second seller is seeded.
- Checkout as customer and show stock decrement.
- Explain invalid status transition rejection.
- Show the three aggregation report endpoints.
- Connect Socket.IO with access token and observe order events.
