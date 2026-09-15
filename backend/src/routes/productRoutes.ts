import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { db } from "../prisma/db";

const productRoutes = Router();

// =========================================================
// SUPABASE IMAGE UPLOAD CONFIGURATION
// =========================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =========================================================
// UPLOAD PRODUCT IMAGE
// =========================================================

productRoutes.post(
  "/upload-image",
  upload.single("image"),
  async (req, res) => {
    try {
      // -----------------------------------------------------
      // CHECK IMAGE
      // -----------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      // -----------------------------------------------------
      // ALLOWED IMAGE TYPES
      // -----------------------------------------------------

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        });
      }

      // -----------------------------------------------------
      // FILE EXTENSION
      // -----------------------------------------------------

      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };

      const extension = extensionMap[req.file.mimetype];

      // -----------------------------------------------------
      // UNIQUE FILE NAME
      // -----------------------------------------------------

      const fileName = `products/${randomUUID()}.${extension}`;

      // -----------------------------------------------------
      // UPLOAD TO SUPABASE STORAGE
      // -----------------------------------------------------

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(
          "SUPABASE IMAGE UPLOAD ERROR:",
          uploadError
        );

        return res.status(500).json({
          success: false,
          message: "Failed to upload product image.",
        });
      }

      // -----------------------------------------------------
      // GET PUBLIC IMAGE URL
      // -----------------------------------------------------

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,
        message: "Product image uploaded successfully.",
        data: {
          imageUrl: data.publicUrl,
        },
      });
    } catch (error) {
      console.error(
        "UPLOAD PRODUCT IMAGE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload product image.",
      });
    }
  }
);

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
      error:
        error instanceof Error
          ? error.message
          : String(error),
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
      error:
        error instanceof Error
          ? error.message
          : String(error),
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

    // -----------------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------------

    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category, price and image are required",
      });
    }

    // -----------------------------------------------------
    // PRICE VALIDATION
    // -----------------------------------------------------

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    // -----------------------------------------------------
    // OLD PRICE
    // -----------------------------------------------------

    const numericOldPrice =
      oldPrice === null ||
      oldPrice === "" ||
      oldPrice === undefined
        ? null
        : Number(oldPrice);

    if (
      numericOldPrice !== null &&
      (!Number.isFinite(numericOldPrice) ||
        numericOldPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid old price",
      });
    }

    // -----------------------------------------------------
    // CREATE PRODUCT
    // -----------------------------------------------------

    const product =
      await db.orm.public.Product.create({
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
          numericOldPrice === null
            ? null
            : Math.round(numericOldPrice),

        image: String(image).trim(),

        badge:
          badge === null ||
          badge === undefined ||
          badge === ""
            ? null
            : String(badge).trim(),

        isNew: Boolean(isNew),

        isSale: Boolean(isSale),

        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      });

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

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
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================================================
// UPDATE PRODUCT
// =========================================================

productRoutes.put("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    // -----------------------------------------------------
    // PRODUCT ID VALIDATION
    // -----------------------------------------------------

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -----------------------------------------------------
    // CHECK EXISTING PRODUCT
    // -----------------------------------------------------

    const existingProduct =
      await db.orm.public.Product
        .where({ id: productId })
        .first();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------------------------------------------------
    // REQUEST DATA
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------------

    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category, price and image are required",
      });
    }

    // -----------------------------------------------------
    // PRICE VALIDATION
    // -----------------------------------------------------

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    // -----------------------------------------------------
    // OLD PRICE
    // -----------------------------------------------------

    const numericOldPrice =
      oldPrice === null ||
      oldPrice === "" ||
      oldPrice === undefined
        ? null
        : Number(oldPrice);

    if (
      numericOldPrice !== null &&
      (!Number.isFinite(numericOldPrice) ||
        numericOldPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid old price",
      });
    }

    // -----------------------------------------------------
    // UPDATE PRODUCT
    // -----------------------------------------------------

    const product =
      await db.orm.public.Product
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
            numericOldPrice === null
              ? null
              : Math.round(numericOldPrice),

          image: String(image).trim(),

          badge:
            badge === null ||
            badge === undefined ||
            badge === ""
              ? null
              : String(badge).trim(),

          isNew: Boolean(isNew),

          isSale: Boolean(isSale),

          isActive:
            isActive === undefined
              ? true
              : Boolean(isActive),
        });

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

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
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================================================
// EXPORT
// =========================================================

export default productRoutes;