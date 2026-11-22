# ShopFlow: E-Commerce and Inventory Management System
## Backend Development Capstone Project Report

**Student name(s):** [Enter names]  
**Programme:** B.Tech CSE (AI & ML)  
**Course:** Backend Development  
**Technology:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO  
**Faculty:** [Enter faculty name]  
**Institution:** [Enter institution]  
**Submission date:** [Enter date]

## 1. Abstract
ShopFlow is a backend application for an e-commerce and inventory workflow. It supports customers who browse products, manage carts and place orders; sellers who manage their own listings and fulfil orders; and administrators who manage categories and inspect platform reports. The backend uses Express REST APIs, MongoDB/Mongoose data models, bcrypt password hashing, JWT access and refresh tokens, role-based authorization, aggregation pipelines and authenticated Socket.IO notifications. Payment is simulated for academic demonstration.

## 2. Problem Statement
Small online stores need a consistent way to manage product listings, customer carts, order processing and stock. Without server-side validation, stock may become negative, prices may be manipulated by clients, and users may access records outside their permissions. ShopFlow addresses these issues through role-aware APIs and database-level inventory checks.

## 3. Objectives
1. Build a product-to-order backend workflow.
2. Implement customer, seller and administrator roles.
3. Model users, categories, products, carts and orders.
4. Maintain inventory safely during checkout.
5. Generate sales and inventory reports using MongoDB aggregation.
6. Provide real-time order notifications.

## 4. Scope and Limitations
Included: authentication, RBAC, product/category management, cart, checkout, simulated payment, order status, stock restoration on permitted cancellation, reports and real-time notifications. Excluded: genuine payment processing, shipping-provider integration, production-grade tax calculation and deployment-scale distributed inventory. Multi-item checkout uses atomic per-product stock reservations with compensating restoration; a replica-set transaction is recommended for production.

## 5. Functional and Non-Functional Requirements
Functional: register/login/refresh/logout; role-restricted product and category CRUD; search/filter/pagination; cart operations; checkout; order history/status; sales/best-seller/inventory reports; Socket.IO updates.
Non-functional: password hashing, token protection, input validation, consistent JSON errors, modular MVC structure, indexed queries, logging and maintainability.

## 6. Architecture and Modules
The application follows a layered MVC structure:
Client/Postman → Express routes → authentication/authorization middleware → controllers → Mongoose models → MongoDB.
Socket.IO authenticates the access JWT and sends private user notifications. EventEmitter broadcasts internal domain events independently of HTTP response logic.

## 7. Database Design
Collections: users, categories, products, carts, orders. Product references category and seller. Cart references its customer and product items. Order stores customer and item snapshots including product name, seller, unit price and quantity. See `DATABASE_DESIGN.md` for relationships and indexes.

## 8. REST API Documentation
See `API_DOCUMENTATION.md`. APIs are grouped under `/api/auth`, `/api/categories`, `/api/products`, `/api/cart`, `/api/orders` and `/api/reports`.

## 9. Authentication and Authorization
Passwords are hashed using bcrypt. Login returns a short-lived JWT access token and a longer-lived refresh token. Only SHA-256 hashes of refresh tokens are stored. Refresh rotates tokens and logout revokes the supplied refresh token. Middleware validates the access token, loads the active user and enforces role permissions. Ownership checks prevent customers and sellers from accessing unrelated resources.

## 10. Implementation Details
Node.js runs the HTTP server; Express handles routes and middleware. Mongoose defines schemas, validation, references and indexes. Checkout calculates prices from database records and uses conditional atomic stock decrement. Order state transitions are checked on the server. Payment is clearly labelled simulated. EventEmitter emits `order:placed`; Socket.IO sends `order:updated` and `seller:new-order`.

## 11. Testing Strategy and Test Cases
Use Postman collection and the test cases in README. Evidence should include:
- Successful registration/login/product browse/cart/checkout.
- Missing required fields (400).
- Missing/invalid access token (401).
- Customer attempting seller/admin action (403).
- Seller attempting to modify another seller's product (404).
- Unknown product/order ID (404).
- Insufficient inventory / duplicate conflict (409).
- Invalid order status transition (400).
- Admin aggregation reports (200) and customer report access (403).
Attach actual screenshots from your own test run before submission.

## 12. Screenshots / Demonstration Evidence
[Insert screenshots: health check, login response, product list, cart, checkout/order, updated stock, Socket.IO event, admin reports, negative authorization test.]

## 13. Conclusion and Future Enhancements
ShopFlow demonstrates a complete backend workflow with modular REST APIs, data modelling, security, inventory safeguards, analytics and real-time notifications. Future work can include genuine payment gateway integration, coupons, product reviews, wishlist, invoice generation, email notifications, audit logs and replica-set transactions.

## 14. References
- Node.js documentation: https://nodejs.org/docs/
- Express documentation: https://expressjs.com/
- MongoDB documentation: https://www.mongodb.com/docs/
- Mongoose documentation: https://mongoosejs.com/docs/
- Socket.IO documentation: https://socket.io/docs/v4/
- JSON Web Token introduction: https://jwt.io/introduction
