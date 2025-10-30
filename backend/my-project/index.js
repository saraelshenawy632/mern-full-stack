const express = require("express");
const app = express();
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// Routers
const cartRouter = require("./routes/cartrouter");
const userRouter = require("./routes/usersrouter");
const categoryRouter = require("./routes/categoryrouter");
const productRouter = require("./routes/productrouter");
const ordersRouter = require("./routes/orderrouter");
const adminRoutes = require("./routes/adminRoutes");
const auraAssistantRoutes = require("./routes/auraAssistantRoutes");
const { dataMiddleware, corsMiddleware } = require("./middlewares/middleware");
const { authMiddleware, restrictTo } = require("./auth/auth");

// Middlewares
app.use(corsMiddleware);
app.use(dataMiddleware);
app.use(express.static("public"));
app.use(express.json());

// Routes
app.use("/cart", cartRouter);
app.use("/category", categoryRouter);
app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/order", ordersRouter);
app.use("/dash/admin", authMiddleware, restrictTo("admin"), adminRoutes);
app.use("/aura-assistant", auraAssistantRoutes);

mongoose
  .connect(process.env.mongo_url)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

const PORT = process.env.Port;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

});
