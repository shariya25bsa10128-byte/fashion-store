import { Router } from "express";
import { db } from "../prisma/db";

const productRoutes = Router();

// =========================================================
// GET ALL PRODUCTS
// =========================================================

productRoutes.get("/", async (_req, res) => {
  try {
    const products = await db.orm.public.Product
      .where({ isActive: true })
      .include("variants")
      .all();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// =========================================================
// GET SINGLE PRODUCT
// =========================================================

productRoutes.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await db.orm.public.Product
      .where({
        id: productId,
        isActive: true,
      })
      .include("variants")
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// =========================================================
// EXPORT
// =========================================================

export default productRoutes;