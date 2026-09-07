import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

// =========================================================
// APPLY COUPON
// POST /api/coupons/apply
// =========================================================
//
// Body:
//
// {
//   "code": "SAVE20",
//   "subtotal": 2000
// }
//
// =========================================================

router.post("/apply", async (req, res) => {
  try {
    let { code, subtotal } = req.body;

    // -------------------------------------------------------
    // VALIDATE CODE
    // -------------------------------------------------------

    if (
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    code = code.trim().toUpperCase();

    // -------------------------------------------------------
    // VALIDATE SUBTOTAL
    // -------------------------------------------------------

    const numericSubtotal = Number(subtotal);

    if (
      !Number.isFinite(numericSubtotal) ||
      numericSubtotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    // -------------------------------------------------------
    // FIND COUPON
    // -------------------------------------------------------

    const coupon =
      await db.orm.public.Coupon
        .where({
          code,
        })
        .first();

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // -------------------------------------------------------
    // ACTIVE CHECK
    // -------------------------------------------------------

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    // -------------------------------------------------------
    // EXPIRY CHECK
    // -------------------------------------------------------

    if (coupon.expiresAt) {
      const expiryDate =
        new Date(coupon.expiresAt);

      if (
        !Number.isNaN(
          expiryDate.getTime()
        ) &&
        expiryDate < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired",
        });
      }
    }

    // -------------------------------------------------------
    // USAGE LIMIT CHECK
    // -------------------------------------------------------

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined
    ) {
      if (
        Number(coupon.usedCount) >=
        Number(coupon.usageLimit)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has reached its usage limit",
        });
      }
    }

    // -------------------------------------------------------
    // MINIMUM ORDER CHECK
    // -------------------------------------------------------

    const minimumAmount =
      Number(coupon.minimumAmount) || 0;

    if (
      numericSubtotal < minimumAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${minimumAmount.toLocaleString(
          "en-IN"
        )} is required for this coupon`,
      });
    }

    // -------------------------------------------------------
    // CALCULATE DISCOUNT
    // -------------------------------------------------------

    const discountType =
      String(
        coupon.discountType || ""
      ).toUpperCase();

    const discountValue =
      Number(coupon.discountValue) || 0;

    let discount = 0;

    if (
      discountType === "PERCENTAGE"
    ) {
      discount =
        (numericSubtotal *
          discountValue) /
        100;

    } else if (
      discountType === "FIXED"
    ) {
      discount = discountValue;

    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coupon discount type",
      });
    }

    // -------------------------------------------------------
    // MAXIMUM DISCOUNT
    // -------------------------------------------------------

    if (
      coupon.maximumDiscount !== null &&
      coupon.maximumDiscount !== undefined
    ) {
      const maximumDiscount =
        Number(
          coupon.maximumDiscount
        );

      if (
        Number.isFinite(
          maximumDiscount
        ) &&
        maximumDiscount > 0
      ) {
        discount =
          Math.min(
            discount,
            maximumDiscount
          );
      }
    }

    // -------------------------------------------------------
    // DISCOUNT CANNOT EXCEED SUBTOTAL
    // -------------------------------------------------------

    discount =
      Math.min(
        discount,
        numericSubtotal
      );

    // -------------------------------------------------------
    // ROUND DISCOUNT
    // -------------------------------------------------------

    discount =
      Math.round(discount);

    // -------------------------------------------------------
    // FINAL SUBTOTAL
    // -------------------------------------------------------

    const discountedSubtotal =
      Math.max(
        numericSubtotal -
          discount,
        0
      );

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Coupon applied successfully",

      data: {
        couponId: coupon.id,

        code: coupon.code,

        discountType:
          coupon.discountType,

        discountValue:
          coupon.discountValue,

        subtotal:
          numericSubtotal,

        discount,

        discountedSubtotal,

        minimumAmount:
          coupon.minimumAmount,

        maximumDiscount:
          coupon.maximumDiscount,

        expiresAt:
          coupon.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Apply coupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to apply coupon",
    });
  }
});

export default router;