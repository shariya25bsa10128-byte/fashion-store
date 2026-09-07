import { Router, Request, Response } from "express";
import { db } from "../prisma/db";

const router = Router();

// =========================================================
// GET USER CART
// GET /api/cart/:userId
// =========================================================

router.get(
  "/:userId",
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Check user
      const user = await db.orm.public.User
        .where({ id: userId })
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find cart
      const cart = await db.orm.public.Cart
        .where({ userId })
        .first();

      // User doesn't have a cart yet
      if (!cart) {
        return res.status(200).json({
          success: true,
          data: {
            id: null,
            userId,
            items: [],
          },
        });
      }

      // Get cart items
      const items = await db.orm.public.CartItem
        .where({ cartId: cart.id })
        .orderBy((item) => item.id.asc())
        .all();

      return res.status(200).json({
        success: true,
        data: {
          id: cart.id,
          userId: cart.userId,
          items,
        },
      });
    } catch (error) {
      console.error("Get cart error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
      });
    }
  }
);

// =========================================================
// ADD ITEM TO CART
// POST /api/cart/:userId/items
// =========================================================

router.post(
  "/:userId/items",
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const {
        productId,
        variantId,
        size,
        color,
        quantity,
      } = req.body;

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "productId is required",
        });
      }

      const parsedProductId = Number(productId);
      const parsedQuantity = Number(quantity ?? 1);

      if (!Number.isInteger(parsedProductId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      // -----------------------------------------------------
      // CHECK USER
      // -----------------------------------------------------

      const user = await db.orm.public.User
        .where({ id: userId })
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
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

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: "Product is currently unavailable",
        });
      }

      // -----------------------------------------------------
      // CHECK VARIANT
      // -----------------------------------------------------

      let parsedVariantId: number | null = null;

      if (variantId !== undefined && variantId !== null) {
        parsedVariantId = Number(variantId);

        if (!Number.isInteger(parsedVariantId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid variant ID",
          });
        }

        const variant =
          await db.orm.public.ProductVariant
            .where({ id: parsedVariantId })
            .first();

        if (!variant) {
          return res.status(404).json({
            success: false,
            message: "Product variant not found",
          });
        }

        if (variant.productId !== parsedProductId) {
          return res.status(400).json({
            success: false,
            message: "Variant does not belong to this product",
          });
        }

        if (variant.stock < parsedQuantity) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock",
            availableStock: variant.stock,
          });
        }
      }

      // -----------------------------------------------------
      // GET OR CREATE CART
      // -----------------------------------------------------

      let cart = await db.orm.public.Cart
        .where({ userId })
        .first();

      if (!cart) {
        cart = await db.orm.public.Cart.create({
          userId,
        });
      }

      // -----------------------------------------------------
      // CHECK EXISTING ITEM
      // -----------------------------------------------------

      const existingItems = await db.orm.public.CartItem
        .where({ cartId: cart.id })
        .all();

      const existingItem = existingItems.find((item) => {
        return (
          item.productId === parsedProductId &&
          item.variantId === parsedVariantId &&
          item.size === (size ?? null) &&
          item.color === (color ?? null)
        );
      });

      // -----------------------------------------------------
      // UPDATE EXISTING ITEM
      // -----------------------------------------------------

      if (existingItem) {
        let newQuantity =
          existingItem.quantity + parsedQuantity;

        // Check variant stock again
        if (parsedVariantId !== null) {
          const variant =
            await db.orm.public.ProductVariant
              .where({ id: parsedVariantId })
              .first();

          if (variant && newQuantity > variant.stock) {
            return res.status(400).json({
              success: false,
              message: "Insufficient stock",
              availableStock: variant.stock,
            });
          }
        }

        const updatedItem =
          await db.orm.public.CartItem
            .where({ id: existingItem.id })
            .update({
              quantity: newQuantity,
            });

        return res.status(200).json({
          success: true,
          message: "Cart item quantity updated",
          data: updatedItem,
        });
      }

      // -----------------------------------------------------
      // CREATE NEW CART ITEM
      // -----------------------------------------------------

      const cartItem =
        await db.orm.public.CartItem.create({
          cartId: cart.id,
          productId: parsedProductId,
          variantId: parsedVariantId,
          size: size ?? null,
          color: color ?? null,
          quantity: parsedQuantity,
        });

      return res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cartItem,
      });
    } catch (error) {
      console.error("Add cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
      });
    }
  }
);

// =========================================================
// UPDATE CART ITEM QUANTITY
// PUT /api/cart/:userId/items/:itemId
// =========================================================

router.put(
  "/:userId/items/:itemId",
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const itemId = Number(req.params.itemId);

      if (
        !Number.isInteger(userId) ||
        !Number.isInteger(itemId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID or item ID",
        });
      }

      const quantity = Number(req.body.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      const cart = await db.orm.public.Cart
        .where({ userId })
        .first();

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const item = await db.orm.public.CartItem
        .where({
          id: itemId,
          cartId: cart.id,
        })
        .first();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      // -----------------------------------------------------
      // CHECK STOCK
      // -----------------------------------------------------

      if (item.variantId !== null) {
        const variant =
          await db.orm.public.ProductVariant
            .where({ id: item.variantId })
            .first();

        if (!variant) {
          return res.status(404).json({
            success: false,
            message: "Product variant not found",
          });
        }

        if (quantity > variant.stock) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock",
            availableStock: variant.stock,
          });
        }
      }

      const updatedItem =
        await db.orm.public.CartItem
          .where({ id: itemId })
          .update({
            quantity,
          });

      return res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      console.error("Update cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update cart item",
      });
    }
  }
);

// =========================================================
// REMOVE CART ITEM
// DELETE /api/cart/:userId/items/:itemId
// =========================================================

router.delete(
  "/:userId/items/:itemId",
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const itemId = Number(req.params.itemId);

      if (
        !Number.isInteger(userId) ||
        !Number.isInteger(itemId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID or item ID",
        });
      }

      const cart = await db.orm.public.Cart
        .where({ userId })
        .first();

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const item = await db.orm.public.CartItem
        .where({
          id: itemId,
          cartId: cart.id,
        })
        .first();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      await db.orm.public.CartItem
        .where({ id: itemId })
        .delete();

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    } catch (error) {
      console.error("Remove cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to remove cart item",
      });
    }
  }
);

// =========================================================
// CLEAR CART
// DELETE /api/cart/:userId
// =========================================================

router.delete(
  "/:userId",
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const cart = await db.orm.public.Cart
        .where({ userId })
        .first();

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const items = await db.orm.public.CartItem
        .where({ cartId: cart.id })
        .all();

      for (const item of items) {
        await db.orm.public.CartItem
          .where({ id: item.id })
          .delete();
      }

      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
      });
    } catch (error) {
      console.error("Clear cart error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }
  }
);

export default router;