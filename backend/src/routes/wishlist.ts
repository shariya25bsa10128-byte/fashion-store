import {
  Router,
  Response,
} from "express";

import { db } from "../prisma/db";

import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();


// =========================================================
// AUTHENTICATION
// =========================================================
//
// Every wishlist route requires a valid JWT.
//
// The middleware reads:
//
// Authorization: Bearer <token>
//
// and attaches:
//
// req.user.userId
//
// =========================================================

router.use(authMiddleware);


// =========================================================
// HELPER — GET AUTHENTICATED USER ID
// =========================================================

function getAuthenticatedUserId(
  req: AuthenticatedRequest
): number | null {
  const userId = req.user?.userId;

  if (
    !userId ||
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}


// =========================================================
// HELPER — VERIFY URL USER MATCHES JWT USER
// =========================================================

function verifyUserAccess(
  req: AuthenticatedRequest,
  res: Response
): number | null {

  const authenticatedUserId =
    getAuthenticatedUserId(req);

  if (!authenticatedUserId) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return null;
  }

  const requestedUserId =
    Number(req.params.userId);

  if (
    !Number.isInteger(requestedUserId) ||
    requestedUserId <= 0
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });

    return null;
  }

  // -------------------------------------------------------
  // SECURITY CHECK
  // -------------------------------------------------------

  if (
    requestedUserId !==
    authenticatedUserId
  ) {
    res.status(403).json({
      success: false,
      message:
        "You are not authorized to access this wishlist.",
    });

    return null;
  }

  return authenticatedUserId;
}


// =========================================================
// GET USER WISHLIST
// GET /api/wishlist/:userId
// =========================================================

router.get(
  "/:userId",
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      // ---------------------------------------------------
      // VERIFY AUTHENTICATED USER
      // ---------------------------------------------------

      const userId =
        verifyUserAccess(req, res);

      if (!userId) {
        return;
      }


      // ---------------------------------------------------
      // CHECK USER
      // ---------------------------------------------------

      const user =
        await db.orm.public.User
          .where({
            id: userId,
          })
          .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      // ---------------------------------------------------
      // FIND WISHLIST
      // ---------------------------------------------------

      const wishlist =
        await db.orm.public.Wishlist
          .where({
            userId,
          })
          .first();


      // ---------------------------------------------------
      // USER HAS NO WISHLIST YET
      // ---------------------------------------------------

      if (!wishlist) {

        return res.status(200).json({
          success: true,

          data: {
            id: null,
            userId,
            items: [],
          },
        });
      }


      // ---------------------------------------------------
      // GET WISHLIST ITEMS
      // ---------------------------------------------------

      const items =
        await db.orm.public.WishlistItem
          .where({
            wishlistId:
              wishlist.id,
          })
          .include("product")
          .orderBy(
            (item) => item.id.asc()
          )
          .all();


      // ---------------------------------------------------
      // FORMAT PRODUCTS
      // ---------------------------------------------------

      const products =
        items
          .filter(
            (item) => item.product
          )
          .map((item) => ({
            ...item.product,

            wishlistItemId:
              item.id,
          }));


      // ---------------------------------------------------
      // RESPONSE
      // ---------------------------------------------------

      return res.status(200).json({

        success: true,

        data: {
          id: wishlist.id,

          userId:
            wishlist.userId,

          items: products,
        },

      });

    } catch (error) {

      console.error(
        "Get wishlist error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch wishlist",
      });
    }
  }
);


// =========================================================
// ADD PRODUCT TO WISHLIST
// POST /api/wishlist/:userId/items
// =========================================================

router.post(
  "/:userId/items",
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      // ---------------------------------------------------
      // VERIFY AUTHENTICATED USER
      // ---------------------------------------------------

      const userId =
        verifyUserAccess(req, res);

      if (!userId) {
        return;
      }


      // ---------------------------------------------------
      // PRODUCT ID
      // ---------------------------------------------------

      const {
        productId,
      } = req.body;


      // ---------------------------------------------------
      // VALIDATE PRODUCT ID
      // ---------------------------------------------------

      if (
        productId === undefined ||
        productId === null ||
        productId === ""
      ) {

        return res.status(400).json({
          success: false,
          message:
            "productId is required",
        });
      }


      const parsedProductId =
        Number(productId);


      if (
        !Number.isInteger(
          parsedProductId
        ) ||
        parsedProductId <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }


      // ---------------------------------------------------
      // CHECK USER
      // ---------------------------------------------------

      const user =
        await db.orm.public.User
          .where({
            id: userId,
          })
          .first();


      if (!user) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      // ---------------------------------------------------
      // CHECK PRODUCT
      // ---------------------------------------------------

      const product =
        await db.orm.public.Product
          .where({
            id:
              parsedProductId,
          })
          .first();


      if (!product) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }


      // ---------------------------------------------------
      // CHECK ACTIVE PRODUCT
      // ---------------------------------------------------

      if (!product.isActive) {

        return res.status(400).json({
          success: false,
          message:
            "Product is currently unavailable",
        });
      }


      // ---------------------------------------------------
      // GET OR CREATE WISHLIST
      // ---------------------------------------------------

      let wishlist =
        await db.orm.public.Wishlist
          .where({
            userId,
          })
          .first();


      if (!wishlist) {

        wishlist =
          await db.orm.public.Wishlist.create({
            userId,
          });
      }


      // ---------------------------------------------------
      // CHECK EXISTING ITEM
      // ---------------------------------------------------

      const existingItems =
        await db.orm.public.WishlistItem
          .where({
            wishlistId:
              wishlist.id,
          })
          .all();


      const existingItem =
        existingItems.find(
          (item) =>
            item.productId ===
            parsedProductId
        );


      // ---------------------------------------------------
      // ALREADY IN WISHLIST
      // ---------------------------------------------------

      if (existingItem) {

        return res.status(200).json({
          success: true,

          message:
            "Product is already in wishlist",

          data:
            existingItem,
        });
      }


      // ---------------------------------------------------
      // CREATE WISHLIST ITEM
      // ---------------------------------------------------

      const wishlistItem =
        await db.orm.public.WishlistItem.create({

          wishlistId:
            wishlist.id,

          productId:
            parsedProductId,

        });


      // ---------------------------------------------------
      // RESPONSE
      // ---------------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "Product added to wishlist",

        data:
          wishlistItem,

      });

    } catch (error) {

      console.error(
        "Add wishlist item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to add product to wishlist",
      });
    }
  }
);


// =========================================================
// REMOVE PRODUCT FROM WISHLIST
// DELETE /api/wishlist/:userId/items/:itemId
// =========================================================

router.delete(
  "/:userId/items/:itemId",
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      // ---------------------------------------------------
      // VERIFY AUTHENTICATED USER
      // ---------------------------------------------------

      const userId =
        verifyUserAccess(req, res);

      if (!userId) {
        return;
      }


      // ---------------------------------------------------
      // ITEM ID
      // ---------------------------------------------------

      const itemId =
        Number(req.params.itemId);


      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid item ID",
        });
      }


      // ---------------------------------------------------
      // FIND WISHLIST
      // ---------------------------------------------------

      const wishlist =
        await db.orm.public.Wishlist
          .where({
            userId,
          })
          .first();


      if (!wishlist) {

        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found",
        });
      }


      // ---------------------------------------------------
      // FIND ITEM
      // ---------------------------------------------------

      const item =
        await db.orm.public.WishlistItem
          .where({
            id: itemId,

            wishlistId:
              wishlist.id,
          })
          .first();


      if (!item) {

        return res.status(404).json({
          success: false,
          message:
            "Wishlist item not found",
        });
      }


      // ---------------------------------------------------
      // DELETE ITEM
      // ---------------------------------------------------

      await db.orm.public.WishlistItem
        .where({
          id: itemId,
        })
        .delete();


      // ---------------------------------------------------
      // RESPONSE
      // ---------------------------------------------------

      return res.status(200).json({

        success: true,

        message:
          "Product removed from wishlist",

      });

    } catch (error) {

      console.error(
        "Remove wishlist item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to remove product from wishlist",
      });
    }
  }
);


// =========================================================
// CLEAR WISHLIST
// DELETE /api/wishlist/:userId
// =========================================================

router.delete(
  "/:userId",
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      // ---------------------------------------------------
      // VERIFY AUTHENTICATED USER
      // ---------------------------------------------------

      const userId =
        verifyUserAccess(req, res);

      if (!userId) {
        return;
      }


      // ---------------------------------------------------
      // FIND WISHLIST
      // ---------------------------------------------------

      const wishlist =
        await db.orm.public.Wishlist
          .where({
            userId,
          })
          .first();


      if (!wishlist) {

        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found",
        });
      }


      // ---------------------------------------------------
      // GET ALL ITEMS
      // ---------------------------------------------------

      const items =
        await db.orm.public.WishlistItem
          .where({
            wishlistId:
              wishlist.id,
          })
          .all();


      // ---------------------------------------------------
      // DELETE ITEMS
      // ---------------------------------------------------

      for (
        const item of items
      ) {

        await db.orm.public.WishlistItem
          .where({
            id: item.id,
          })
          .delete();

      }


      // ---------------------------------------------------
      // RESPONSE
      // ---------------------------------------------------

      return res.status(200).json({

        success: true,

        message:
          "Wishlist cleared successfully",

      });

    } catch (error) {

      console.error(
        "Clear wishlist error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to clear wishlist",
      });
    }
  }
);


// =========================================================
// EXPORT
// =========================================================

export default router;