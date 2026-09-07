
import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

// =========================================================
// HELPERS
// =========================================================

const normalizeCode = (code: unknown): string => {
  return String(code || "")
    .trim()
    .toUpperCase();
};

const normalizeDiscountType = (
  discountType: unknown
): string => {
  return String(discountType || "")
    .trim()
    .toUpperCase();
};

const parseInteger = (
  value: unknown,
  defaultValue = 0
): number => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return defaultValue;
  }

  return Math.trunc(numberValue);
};

// =========================================================
// DATE HELPER
// Prisma Next expects TimestamptzString as a string
// =========================================================

const normalizeExpiresAt = (
  value: unknown
): string | null => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsedDate = new Date(String(value));

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate.toISOString();
};

// =========================================================
// VALIDATE COUPON DATA
// =========================================================

const validateCouponData = (
  body: any
) => {
  const code = normalizeCode(
    body.code
  );

  const discountType =
    normalizeDiscountType(
      body.discountType
    );

  const discountValue =
    parseInteger(
      body.discountValue
    );

  const minimumAmount =
    parseInteger(
      body.minimumAmount,
      0
    );

  const maximumDiscount =
    body.maximumDiscount ===
      null ||
    body.maximumDiscount ===
      undefined ||
    body.maximumDiscount === ""
      ? null
      : parseInteger(
          body.maximumDiscount
        );

  const usageLimit =
    body.usageLimit ===
      null ||
    body.usageLimit ===
      undefined ||
    body.usageLimit === ""
      ? null
      : parseInteger(
          body.usageLimit
        );

  const expiresAt =
    normalizeExpiresAt(
      body.expiresAt
    );

  // -------------------------------------------------------
  // CODE
  // -------------------------------------------------------

  if (!code) {
    return {
      valid: false,
      message:
        "Coupon code is required.",
    };
  }

  if (code.length < 3) {
    return {
      valid: false,
      message:
        "Coupon code must contain at least 3 characters.",
    };
  }

  if (code.length > 50) {
    return {
      valid: false,
      message:
        "Coupon code cannot exceed 50 characters.",
    };
  }

  // -------------------------------------------------------
  // DISCOUNT TYPE
  // -------------------------------------------------------

  if (
    discountType !== "PERCENTAGE" &&
    discountType !== "FIXED"
  ) {
    return {
      valid: false,
      message:
        "Discount type must be PERCENTAGE or FIXED.",
    };
  }

  // -------------------------------------------------------
  // DISCOUNT VALUE
  // -------------------------------------------------------

  if (discountValue <= 0) {
    return {
      valid: false,
      message:
        "Discount value must be greater than 0.",
    };
  }

  if (
    discountType ===
      "PERCENTAGE" &&
    discountValue > 100
  ) {
    return {
      valid: false,
      message:
        "Percentage discount cannot exceed 100.",
    };
  }

  // -------------------------------------------------------
  // MINIMUM AMOUNT
  // -------------------------------------------------------

  if (minimumAmount < 0) {
    return {
      valid: false,
      message:
        "Minimum amount cannot be negative.",
    };
  }

  // -------------------------------------------------------
  // MAXIMUM DISCOUNT
  // -------------------------------------------------------

  if (
    maximumDiscount !== null &&
    maximumDiscount <= 0
  ) {
    return {
      valid: false,
      message:
        "Maximum discount must be greater than 0.",
    };
  }

  // -------------------------------------------------------
  // USAGE LIMIT
  // -------------------------------------------------------

  if (
    usageLimit !== null &&
    usageLimit <= 0
  ) {
    return {
      valid: false,
      message:
        "Usage limit must be greater than 0.",
    };
  }

  // -------------------------------------------------------
  // EXPIRATION DATE
  // -------------------------------------------------------

  if (
    body.expiresAt !==
      null &&
    body.expiresAt !==
      undefined &&
    body.expiresAt !== ""
  ) {
    if (!expiresAt) {
      return {
        valid: false,
        message:
          "Invalid expiration date.",
      };
    }
  }

  return {
    valid: true,
    data: {
      code,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      expiresAt,
    },
  };
};

// =========================================================
// GET ALL COUPONS
//
// GET /api/admin/coupons
// =========================================================

router.get(
  "/",
  async (_req, res) => {
    try {
      const coupons =
        await db.orm.public.Coupon
          .orderBy(
            (coupon) =>
              coupon.createdAt.desc()
          )
          .all();

      return res.status(200).json({
        success: true,
        count: coupons.length,
        data: coupons,
      });
    } catch (error) {
      console.error(
        "Get coupons error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch coupons.",
      });
    }
  }
);

// =========================================================
// GET SINGLE COUPON
//
// GET /api/admin/coupons/:id
// =========================================================

router.get(
  "/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          couponId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID.",
        });
      }

      const coupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .first();

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message:
            "Coupon not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      console.error(
        "Get single coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch coupon.",
      });
    }
  }
);

// =========================================================
// CREATE COUPON
//
// POST /api/admin/coupons
// =========================================================

router.post(
  "/",
  async (req, res) => {
    try {
      const validation =
        validateCouponData(
          req.body
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      const {
        code,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        expiresAt,
      } = validation.data!;

      // -----------------------------------------------------
      // CHECK DUPLICATE CODE
      // -----------------------------------------------------

      const existingCoupon =
        await db.orm.public.Coupon
          .where({
            code,
          })
          .first();

      if (existingCoupon) {
        return res.status(409).json({
          success: false,
          message:
            "A coupon with this code already exists.",
        });
      }

      // -----------------------------------------------------
      // CREATE
      // -----------------------------------------------------

      const coupon =
        await db.orm.public.Coupon.create(
          {
            code,
            discountType,
            discountValue,
            minimumAmount,
            maximumDiscount,
            usageLimit,
            usedCount: 0,
            expiresAt,
            isActive: true,
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Coupon created successfully.",
        data: coupon,
      });
    } catch (error: any) {
      console.error(
        "Create coupon error:",
        error
      );

      // Handle unique constraint
      if (
        String(
          error?.message || ""
        )
          .toLowerCase()
          .includes("unique")
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A coupon with this code already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create coupon.",
      });
    }
  }
);

// =========================================================
// UPDATE COUPON
//
// PUT /api/admin/coupons/:id
// =========================================================

router.put(
  "/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          couponId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID.",
        });
      }

      // -----------------------------------------------------
      // CHECK EXISTING COUPON
      // -----------------------------------------------------

      const existingCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .first();

      if (!existingCoupon) {
        return res.status(404).json({
          success: false,
          message:
            "Coupon not found.",
        });
      }

      // -----------------------------------------------------
      // VALIDATE
      // -----------------------------------------------------

      const validation =
        validateCouponData(
          req.body
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      const {
        code,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        expiresAt,
      } = validation.data!;

      // -----------------------------------------------------
      // CHECK DUPLICATE CODE
      // -----------------------------------------------------

      const duplicateCoupon =
        await db.orm.public.Coupon
          .where({
            code,
          })
          .first();

      if (
        duplicateCoupon &&
        Number(
          duplicateCoupon.id
        ) !== couponId
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Another coupon with this code already exists.",
        });
      }

      // -----------------------------------------------------
      // USAGE LIMIT CHECK
      // -----------------------------------------------------

      if (
        usageLimit !== null &&
        usageLimit <
          Number(
            existingCoupon.usedCount
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Usage limit cannot be lower than the current used count (${existingCoupon.usedCount}).`,
        });
      }

      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      const updatedCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .update({
            code,
            discountType,
            discountValue,
            minimumAmount,
            maximumDiscount,
            usageLimit,
            expiresAt,
          });

      return res.status(200).json({
        success: true,
        message:
          "Coupon updated successfully.",
        data: updatedCoupon,
      });
    } catch (error) {
      console.error(
        "Update coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update coupon.",
      });
    }
  }
);

// =========================================================
// ACTIVATE / DEACTIVATE COUPON
//
// PATCH /api/admin/coupons/:id/status
//
// Body:
// {
//   "isActive": true
// }
// =========================================================

router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          couponId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID.",
        });
      }

      const {
        isActive,
      } = req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false.",
        });
      }

      // -----------------------------------------------------
      // CHECK COUPON
      // -----------------------------------------------------

      const existingCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .first();

      if (!existingCoupon) {
        return res.status(404).json({
          success: false,
          message:
            "Coupon not found.",
        });
      }

      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      const updatedCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .update({
            isActive,
          });

      return res.status(200).json({
        success: true,
        message: isActive
          ? "Coupon activated successfully."
          : "Coupon deactivated successfully.",
        data: updatedCoupon,
      });
    } catch (error) {
      console.error(
        "Update coupon status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update coupon status.",
      });
    }
  }
);

// =========================================================
// DELETE COUPON
//
// DELETE /api/admin/coupons/:id
// =========================================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          couponId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID.",
        });
      }

      // -----------------------------------------------------
      // CHECK COUPON
      // -----------------------------------------------------

      const existingCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .first();

      if (!existingCoupon) {
        return res.status(404).json({
          success: false,
          message:
            "Coupon not found.",
        });
      }

      // -----------------------------------------------------
      // DELETE
      // -----------------------------------------------------

      await db.orm.public.Coupon
        .where({
          id: couponId,
        })
        .delete();

      return res.status(200).json({
        success: true,
        message:
          "Coupon deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete coupon.",
      });
    }
  }
);

// =========================================================
// VALIDATE COUPON FOR CUSTOMER CHECKOUT
//
// POST /api/coupons/validate
//
// Body:
// {
//   "code": "SAVE20",
//   "subtotal": 2500
// }
// =========================================================

router.post(
  "/validate",
  async (req, res) => {
    try {
      const code =
        normalizeCode(
          req.body?.code
        );

      const subtotal =
        Number(
          req.body?.subtotal
        );

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!code) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code is required.",
        });
      }

      if (
        !Number.isFinite(
          subtotal
        ) ||
        subtotal < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subtotal.",
        });
      }

      // -----------------------------------------------------
      // FIND COUPON
      // -----------------------------------------------------

      const coupon =
        await db.orm.public.Coupon
          .where({
            code,
          })
          .first();

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid coupon code.",
        });
      }

      // -----------------------------------------------------
      // ACTIVE CHECK
      // -----------------------------------------------------

      if (!coupon.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon is no longer active.",
        });
      }

      // -----------------------------------------------------
      // EXPIRATION CHECK
      // -----------------------------------------------------

      if (coupon.expiresAt) {
        const expiryTime =
          new Date(
            coupon.expiresAt
          ).getTime();

        if (
          !Number.isFinite(
            expiryTime
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon has an invalid expiration date.",
          });
        }

        if (
          expiryTime <
          Date.now()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon has expired.",
          });
        }
      }

      // -----------------------------------------------------
      // USAGE LIMIT
      // -----------------------------------------------------

      if (
        coupon.usageLimit !==
          null &&
        Number(
          coupon.usedCount
        ) >=
          Number(
            coupon.usageLimit
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has reached its usage limit.",
        });
      }

      // -----------------------------------------------------
      // MINIMUM AMOUNT
      // -----------------------------------------------------

      const minimumAmount =
        Number(
          coupon.minimumAmount
        );

      if (
        subtotal <
        minimumAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Minimum order value for this coupon is ₹${minimumAmount.toLocaleString("en-IN")}.`,
        });
      }

      // -----------------------------------------------------
      // CALCULATE DISCOUNT
      // -----------------------------------------------------

      let discount = 0;

      if (
        String(
          coupon.discountType
        ).toUpperCase() ===
        "PERCENTAGE"
      ) {
        discount =
          Math.floor(
            (subtotal *
              Number(
                coupon.discountValue
              )) /
              100
          );
      } else {
        discount =
          Number(
            coupon.discountValue
          );
      }

      // -----------------------------------------------------
      // MAXIMUM DISCOUNT
      // -----------------------------------------------------

      if (
        coupon.maximumDiscount !==
          null &&
        discount >
          Number(
            coupon.maximumDiscount
          )
      ) {
        discount =
          Number(
            coupon.maximumDiscount
          );
      }

      // -----------------------------------------------------
      // DISCOUNT CANNOT EXCEED SUBTOTAL
      // -----------------------------------------------------

      discount = Math.min(
        discount,
        subtotal
      );

      const finalSubtotal =
        subtotal - discount;

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Coupon applied successfully.",
        data: {
          couponId:
            coupon.id,

          code:
            coupon.code,

          discountType:
            coupon.discountType,

          discountValue:
            coupon.discountValue,

          discount,

          subtotal,

          finalSubtotal,
        },
      });
    } catch (error) {
      console.error(
        "Validate coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to validate coupon.",
      });
    }
  }
);

// =========================================================
// EXPORT
// =========================================================

export default router;