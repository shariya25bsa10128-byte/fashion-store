import { Router, Request, Response } from "express";
import { db } from "../prisma/db";

const router = Router();

// =========================================================
// GET VARIANTS FOR A PRODUCT
// GET /api/products/:productId/variants
// =========================================================

router.get(
  "/product/:productId",
  async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product = await db.orm.public.Product
        .where({ id: productId })
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const variants = await db.orm.public.ProductVariant
        .where({ productId })
        .orderBy((variant) => variant.id.asc())
        .all();

      return res.status(200).json({
        success: true,
        count: variants.length,
        data: variants,
      });
    } catch (error) {
      console.error("Get product variants error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch product variants",
      });
    }
  }
);

// =========================================================
// GET SINGLE VARIANT
// GET /api/variants/:id
// =========================================================

router.get(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const variantId = Number(req.params.id);

      if (!Number.isInteger(variantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant ID",
        });
      }

      const variant = await db.orm.public.ProductVariant
        .where({ id: variantId })
        .first();

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: variant,
      });
    } catch (error) {
      console.error("Get variant error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch variant",
      });
    }
  }
);

// =========================================================
// CREATE VARIANT
// POST /api/variants
// =========================================================

router.post(
  "/",
  async (req: Request, res: Response) => {
    try {
      const {
        productId,
        size,
        color,
        sku,
        stock,
      } = req.body;

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!productId || !sku) {
        return res.status(400).json({
          success: false,
          message: "productId and sku are required",
        });
      }

      const parsedProductId = Number(productId);
      const parsedStock = Number(stock ?? 0);

      if (!Number.isInteger(parsedProductId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer",
        });
      }

      // -----------------------------------------------------
      // CHECK PRODUCT
      // -----------------------------------------------------

      const product = await db.orm.public.Product
        .where({ id: parsedProductId })
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // -----------------------------------------------------
      // CHECK SKU
      // -----------------------------------------------------

      const existingSku = await db.orm.public.ProductVariant
        .where({ sku: String(sku) })
        .first();

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: "SKU already exists",
        });
      }

      // -----------------------------------------------------
      // CREATE VARIANT
      // -----------------------------------------------------

      const variant = await db.orm.public.ProductVariant.create({
        productId: parsedProductId,
        size: size ?? null,
        color: color ?? null,
        sku: String(sku),
        stock: parsedStock,
      });

      return res.status(201).json({
        success: true,
        message: "Product variant created successfully",
        data: variant,
      });
    } catch (error) {
      console.error("Create variant error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create product variant",
      });
    }
  }
);

// =========================================================
// UPDATE VARIANT
// PUT /api/variants/:id
// =========================================================

router.put(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const variantId = Number(req.params.id);

      if (!Number.isInteger(variantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant ID",
        });
      }

      const existingVariant = await db.orm.public.ProductVariant
        .where({ id: variantId })
        .first();

      if (!existingVariant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      const {
        size,
        color,
        sku,
        stock,
      } = req.body;

      // -----------------------------------------------------
      // SKU CHECK
      // -----------------------------------------------------

      if (sku !== undefined && String(sku) !== existingVariant.sku) {
        const existingSku = await db.orm.public.ProductVariant
          .where({ sku: String(sku) })
          .first();

        if (existingSku && existingSku.id !== variantId) {
          return res.status(409).json({
            success: false,
            message: "SKU already exists",
          });
        }
      }

      // -----------------------------------------------------
      // STOCK VALIDATION
      // -----------------------------------------------------

      if (stock !== undefined) {
        const parsedStock = Number(stock);

        if (
          !Number.isInteger(parsedStock) ||
          parsedStock < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Stock must be a non-negative integer",
          });
        }
      }

      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      const updatedVariant =
        await db.orm.public.ProductVariant
          .where({ id: variantId })
          .update({
            ...(size !== undefined && {
              size: size,
            }),

            ...(color !== undefined && {
              color: color,
            }),

            ...(sku !== undefined && {
              sku: String(sku),
            }),

            ...(stock !== undefined && {
              stock: Number(stock),
            }),
          });

      return res.status(200).json({
        success: true,
        message: "Product variant updated successfully",
        data: updatedVariant,
      });
    } catch (error) {
      console.error("Update variant error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update product variant",
      });
    }
  }
);

// =========================================================
// DELETE VARIANT
// DELETE /api/variants/:id
// =========================================================

router.delete(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const variantId = Number(req.params.id);

      if (!Number.isInteger(variantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant ID",
        });
      }

      const existingVariant =
        await db.orm.public.ProductVariant
          .where({ id: variantId })
          .first();

      if (!existingVariant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      // Instead of deleting the database row,
      // set stock to 0 so the variant cannot be purchased.
      const updatedVariant =
        await db.orm.public.ProductVariant
          .where({ id: variantId })
          .update({
            stock: 0,
          });

      return res.status(200).json({
        success: true,
        message: "Product variant disabled successfully",
        data: updatedVariant,
      });
    } catch (error) {
      console.error("Delete variant error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to disable product variant",
      });
    }
  }
);

export default router;