import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./src/routes/auth";
import addressRouter from "./src/routes/address";
import ordersRouter from "./src/routes/orders";
import adminRouter from "./src/routes/admin";
import productsRouter from "./src/routes/products";
import variantsRouter from "./src/routes/variants";
import cartRouter from "./src/routes/cart";
import wishlistRouter from "./src/routes/wishlist";
import reviewRoutes from "./src/routes/reviews";
import couponRoutes from "./src/routes/coupons";

// =========================================================
// ENVIRONMENT
// =========================================================

dotenv.config();

// =========================================================
// EXPRESS APP
// =========================================================

const app = express();

// =========================================================
// PORT + HOST
// =========================================================

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",

  // 127.0.0.1
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",

  // Production frontend
  ...(process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // Example: Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =========================================================
// BODY PARSING
// =========================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =========================================================
// ROOT HEALTH CHECK
// =========================================================

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "FashionStore API is running",
  });
});

// =========================================================
// API HEALTH CHECK
// =========================================================

app.get("/api", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "FashionStore API is working",
  });
});

// =========================================================
// AUTH ROUTES
// =========================================================

app.use("/api/auth", authRouter);

// =========================================================
// REVIEW ROUTES
// =========================================================

app.use("/api/reviews", reviewRoutes);

// =========================================================
// COUPON ROUTES
// =========================================================

app.use("/api/coupons", couponRoutes);

// =========================================================
// ADDRESS ROUTES
// =========================================================

app.use("/api/addresses", addressRouter);

// =========================================================
// PRODUCT ROUTES
// =========================================================


// =========================================================
// ORDER ROUTES
// =========================================================

app.use("/api/orders", ordersRouter);

// =========================================================
// ADMIN ROUTES
// =========================================================

app.use("/api/admin", adminRouter);

// =========================================================
// VARIANT ROUTES
// =========================================================

app.use("/api/variants", variantsRouter);

// =========================================================
// CART ROUTES
// =========================================================

app.use("/api/cart", cartRouter);

// =========================================================
// WISHLIST ROUTES
// =========================================================

app.use("/api/wishlist", wishlistRouter);

// =========================================================
// 404 HANDLER
// =========================================================

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("=========================================");
  console.log("       FASHIONSTORE BACKEND API");
  console.log("=========================================");
  console.log(`Server:    http://${HOST}:${PORT}`);
  console.log(`API:       http://${HOST}:${PORT}/api`);
  console.log(`Auth:      http://${HOST}:${PORT}/api/auth`);
  console.log(`Addresses: http://${HOST}:${PORT}/api/addresses`);
  console.log(`Products:  http://${HOST}:${PORT}/api/products`);
  console.log(`Orders:    http://${HOST}:${PORT}/api/orders`);
  console.log(`Variants:  http://${HOST}:${PORT}/api/variants`);
  console.log(`Cart:      http://${HOST}:${PORT}/api/cart`);
  console.log(`Wishlist:  http://${HOST}:${PORT}/api/wishlist`);
  console.log(`Reviews:   http://${HOST}:${PORT}/api/reviews`);
  console.log(`Coupons:   http://${HOST}:${PORT}/api/coupons`);
  console.log(`Admin:     http://${HOST}:${PORT}/api/admin`);
  console.log("=========================================");
  console.log("");
});