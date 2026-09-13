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
// CREATE PRODUCT
// =========================================================

productRoutes.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      oldPrice,
      image,
      badge,
      isNew,
      isSale,
      isActive,
    } = req.body;

    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and image are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    const numericOldPrice =
      oldPrice === null || oldPrice === "" || oldPrice === undefined
        ? null
        : Number(oldPrice);

    if (
      numericOldPrice !== null &&
      (!Number.isFinite(numericOldPrice) || numericOldPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid old price",
      });
    }

    const product = await db.orm.public.Product.create({
      name: String(name).trim(),
      description:
        description === null || description === undefined || description === ""
          ? null
          : String(description).trim(),
      category: String(category).trim(),
      subcategory:
        subcategory === null ||
        subcategory === undefined ||
        subcategory === ""
          ? null
          : String(subcategory).trim(),
      price: Math.round(numericPrice),
      oldPrice:
        numericOldPrice === null ? null : Math.round(numericOldPrice),
      image: String(image).trim(),
      badge:
        badge === null || badge === undefined || badge === ""
          ? null
          : String(badge).trim(),
      isNew: Boolean(isNew),
      isSale: Boolean(isSale),
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// =========================================================
// UPDATE PRODUCT
// =========================================================

productRoutes.put("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingProduct = await db.orm.public.Product
      .where({ id: productId })
      .first();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      oldPrice,
      image,
      badge,
      isNew,
      isSale,
      isActive,
    } = req.body;

    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and image are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    const numericOldPrice =
      oldPrice === null || oldPrice === "" || oldPrice === undefined
        ? null
        : Number(oldPrice);

    if (
      numericOldPrice !== null &&
      (!Number.isFinite(numericOldPrice) || numericOldPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid old price",
      });
    }

    const product = await db.orm.public.Product
      .where({ id: productId })
      .update({
        name: String(name).trim(),
        description:
          description === null ||
          description === undefined ||
          description === ""
            ? null
            : String(description).trim(),
        category: String(category).trim(),
        subcategory:
          subcategory === null ||
          subcategory === undefined ||
          subcategory === ""
            ? null
            : String(subcategory).trim(),
        price: Math.round(numericPrice),
        oldPrice:
          numericOldPrice === null ? null : Math.round(numericOldPrice),
        image: String(image).trim(),
        badge:
          badge === null || badge === undefined || badge === ""
            ? null
            : String(badge).trim(),
        isNew: Boolean(isNew),
        isSale: Boolean(isSale),
        isActive: isActive === undefined ? true : Boolean(isActive),
      });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// =========================================================
// EXPORT
// =========================================================

export default productRoutes;