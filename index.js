// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const e_commerce_users = require("./models/user");
const product_schema = require("./models/product");
const cart = require("./models/cart");

const app = express();

// ------------------------------
// CORS FOR DEPLOYED FRONTEND
// ------------------------------
app.use(
  cors({
    origin: "https://mern-ecommerce-69hz.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ------------------------------
// MongoDB Atlas connection
// ------------------------------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected via Atlas");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// ------------------------------
// USER ROUTES
// ------------------------------
app.get("/", (req, res) => {
  res.send(`<h1>What the fuck!!</h1>`);
});
// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await e_commerce_users.findOne({ email });

    if (exists) return res.status(400).send("User already exists");

    const user = await e_commerce_users.create({ name, email, password });
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await e_commerce_users.findOne({ email });
    if (!user) return res.status(404).send("User not found");
    if (user.password !== password)
      return res.status(400).send("Incorrect password");

    res.send({
      message: "User logged in",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET PROFILE
app.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await e_commerce_users.findOne({ email });

    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// UPDATE PROFILE
app.put("/profile/update", async (req, res) => {
  try {
    const { name, email, address } = req.body;

    const user = await e_commerce_users.findOneAndUpdate(
      { email },
      { name, address },
      { new: true }
    );

    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// ------------------------------
// CLOUDINARY IMAGE UPLOAD
// ------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce_products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// ADD PRODUCT (ADMIN)
app.post("/admin", upload.single("pro_image"), async (req, res) => {
  try {
    const { pro_name, pro_price } = req.body;

    const imageUrl = req.file.path; // Cloudinary URL

    const product = await product_schema.create({
      product_name: pro_name,
      product_price: pro_price,
      product_image: imageUrl,
    });

    res.status(201).send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const result = await product_schema.find();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// ADD TO CART
app.post("/cart", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).send({ message: "Missing user_id or product_id" });
    }

    const newItem = await cart.create({
      user_id,
      product_id,
      quantity: 1,
    });

    res.send({ message: "Item added to cart", newItem });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// VIEW CART
app.get("/viewcart", async (req, res) => {
  try {
    const userId = req.query.userId;

    const cartItems = await cart
      .find({ user_id: userId })
      .populate("product_id");

    res.send(cartItems);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET SINGLE PRODUCT
app.get("/products/:id", async (req, res) => {
  try {
    const findProduct = await product_schema.findById(req.params.id);

    if (!findProduct) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.send(findProduct);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// ------------------------------
// START SERVER
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✔ Backend Running on Port ${PORT}`));
