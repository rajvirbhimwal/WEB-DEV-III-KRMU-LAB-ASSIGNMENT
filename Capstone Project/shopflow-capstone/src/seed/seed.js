require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);
  const [admin, seller, customer] = await User.create([
    { name: "ShopFlow Admin", email: "admin@shopflow.demo", password: "Admin@12345", role: "admin" },
    { name: "Demo Seller", email: "seller@shopflow.demo", password: "Seller@12345", role: "seller" },
    { name: "Demo Customer", email: "customer@shopflow.demo", password: "Customer@12345", role: "customer" }
  ]);
  const categories = await Category.create([
    { name: "Electronics", slug: "electronics", description: "Devices and accessories" },
    { name: "Books", slug: "books", description: "Books and learning material" },
    { name: "Lifestyle", slug: "lifestyle", description: "Daily lifestyle products" }
  ]);
  await Product.create([
    { name: "Wireless Mouse", description: "Ergonomic wireless mouse with adjustable DPI.", price: 799, category: categories[0]._id, seller: seller._id, stock: 25 },
    { name: "Mechanical Keyboard", description: "Compact mechanical keyboard for productivity.", price: 2499, category: categories[0]._id, seller: seller._id, stock: 12 },
    { name: "Clean Code", description: "A practical software craftsmanship book.", price: 599, category: categories[1]._id, seller: seller._id, stock: 18 },
    { name: "Steel Water Bottle", description: "Reusable insulated stainless-steel bottle.", price: 449, category: categories[2]._id, seller: seller._id, stock: 4 }
  ]);
  console.log("Seed complete.");
  console.log("Admin: admin@shopflow.demo / Admin@12345");
  console.log("Seller: seller@shopflow.demo / Seller@12345");
  console.log("Customer: customer@shopflow.demo / Customer@12345");
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
