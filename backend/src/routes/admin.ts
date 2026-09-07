import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

// =========================================================
// ADMIN DASHBOARD
// GET /api/admin/dashboard
// =========================================================

router.get("/dashboard", async (_req, res) => {
  try {
    // -------------------------------------------------------
    // TOTAL USERS
    // -------------------------------------------------------

    const totalUsers =
      await db.orm.public.User.aggregate((agg) => ({
        total: agg.count(),
      }));

    // -------------------------------------------------------
    // TOTAL PRODUCTS
    // -------------------------------------------------------

    const totalProducts =
      await db.orm.public.Product.aggregate((agg) => ({
        total: agg.count(),
      }));

    // -------------------------------------------------------
    // ACTIVE PRODUCTS
    // -------------------------------------------------------

    const activeProducts =
      await db.orm.public.Product
        .where({
          isActive: true,
        })
        .aggregate((agg) => ({
          total: agg.count(),
        }));

    // -------------------------------------------------------
    // INACTIVE PRODUCTS
    // -------------------------------------------------------

    const inactiveProducts =
      await db.orm.public.Product
        .where({
          isActive: false,
        })
        .aggregate((agg) => ({
          total: agg.count(),
        }));

    // -------------------------------------------------------
    // TOTAL ORDERS
    // -------------------------------------------------------

    const totalOrders =
      await db.orm.public.Order.aggregate((agg) => ({
        total: agg.count(),
      }));

    // -------------------------------------------------------
    // TOTAL REVIEWS
    // -------------------------------------------------------

    const totalReviews =
      await db.orm.public.Review.aggregate((agg) => ({
        total: agg.count(),
      }));

    // -------------------------------------------------------
    // TOTAL COUPONS
    // -------------------------------------------------------

    const totalCoupons =
      await db.orm.public.Coupon.aggregate((agg) => ({
        total: agg.count(),
      }));

    // -------------------------------------------------------
    // ACTIVE COUPONS
    // -------------------------------------------------------

    const activeCoupons =
      await db.orm.public.Coupon
        .where({
          isActive: true,
        })
        .aggregate((agg) => ({
          total: agg.count(),
        }));

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        totalUsers: totalUsers.total,

        totalProducts:
          totalProducts.total,

        activeProducts:
          activeProducts.total,

        inactiveProducts:
          inactiveProducts.total,

        totalOrders:
          totalOrders.total,

        totalReviews:
          totalReviews.total,

        totalCoupons:
          totalCoupons.total,

        activeCoupons:
          activeCoupons.total,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard",
    });
  }
});

// =========================================================
// GET ALL CUSTOMERS
// GET /api/admin/customers
// =========================================================

router.get("/customers", async (_req, res) => {
  try {
    const users =
      await db.orm.public.User
        .orderBy(
          (user) =>
            user.createdAt.desc()
        )
        .all();

    // Never send passwords/password hashes
    const customers = users.map(
      (user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    );

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error(
      "Get admin customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customers",
    });
  }
});

// =========================================================
// GET SINGLE CUSTOMER
// GET /api/admin/customers/:id
// =========================================================

router.get(
  "/customers/:id",
  async (req, res) => {
    try {
      const customerId =
        Number(req.params.id);

      if (!Number.isInteger(customerId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid customer ID",
        });
      }

      const user =
        await db.orm.public.User
          .where({
            id: customerId,
          })
          .include("orders")
          .include("addresses")
          .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found",
        });
      }

      const customer = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        orders: (user.orders || []).map(
          (order: any) => ({
            id: order.id,

            orderNumber:
              order.orderNumber,

            total:
              order.total,

            paymentStatus:
              order.paymentStatus,

            orderStatus:
              order.orderStatus,

            createdAt:
              order.createdAt,
          })
        ),

        addresses:
          user.addresses || [],
      };

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error(
        "Get admin customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch customer",
      });
    }
  }
);

// =========================================================
// GET ALL ORDERS
// GET /api/admin/orders
// =========================================================

router.get("/orders", async (_req, res) => {
  try {
    const orders =
      await db.orm.public.Order
        .include("items")
        .orderBy(
          (order) =>
            order.createdAt.desc()
        )
        .all();

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Get admin orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch orders",
    });
  }
});

// =========================================================
// GET ORDER STATISTICS
// GET /api/admin/orders/stats/summary
// =========================================================

router.get(
  "/orders/stats/summary",
  async (_req, res) => {
    try {
      const orders =
        await db.orm.public.Order.all();

      const statistics = {
        total: orders.length,

        placed: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,

        pendingPayment: 0,
        paid: 0,
        failedPayment: 0,

        revenue: 0,
      };

      orders.forEach(
        (order: any) => {
          const orderStatus =
            String(
              order.orderStatus || ""
            ).toUpperCase();

          const paymentStatus =
            String(
              order.paymentStatus || ""
            ).toUpperCase();

          switch (orderStatus) {
            case "PLACED":
              statistics.placed++;
              break;

            case "CONFIRMED":
              statistics.confirmed++;
              break;

            case "PROCESSING":
              statistics.processing++;
              break;

            case "SHIPPED":
              statistics.shipped++;
              break;

            case "DELIVERED":
              statistics.delivered++;
              break;

            case "CANCELLED":
              statistics.cancelled++;
              break;
          }

          switch (paymentStatus) {
            case "PENDING":
              statistics.pendingPayment++;
              break;

            case "PAID":
              statistics.paid++;
              break;

            case "FAILED":
              statistics.failedPayment++;
              break;
          }

          const total =
            Number(order.total);

          if (
            Number.isFinite(total) &&
            orderStatus !== "CANCELLED"
          ) {
            statistics.revenue += total;
          }
        }
      );

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error(
        "Admin order statistics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load order statistics",
      });
    }
  }
);

// =========================================================
// GET SINGLE ORDER
// GET /api/admin/orders/:id
// =========================================================

router.get(
  "/orders/:id",
  async (req, res) => {
    try {
      const orderId =
        Number(req.params.id);

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await db.orm.public.Order
          .where({
            id: orderId,
          })
          .include("items")
          .first();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error(
        "Get admin order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch order",
      });
    }
  }
);

// =========================================================
// UPDATE ORDER
// PUT /api/admin/orders/:id
// =========================================================

router.put(
  "/orders/:id",
  async (req, res) => {
    try {
      const orderId =
        Number(req.params.id);

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const {
        orderStatus,
        paymentStatus,
        trackingNumber,
        courierName,
      } = req.body;

      const existingOrder =
        await db.orm.public.Order
          .where({
            id: orderId,
          })
          .first();

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      const updatedOrder =
        await db.orm.public.Order
          .where({
            id: orderId,
          })
          .update({
            ...(orderStatus !==
              undefined && {
              orderStatus:
                String(orderStatus),
            }),

            ...(paymentStatus !==
              undefined && {
              paymentStatus:
                String(paymentStatus),
            }),

            ...(trackingNumber !==
              undefined && {
              trackingNumber:
                trackingNumber === null
                  ? null
                  : String(
                      trackingNumber
                    ),
            }),

            ...(courierName !==
              undefined && {
              courierName:
                courierName === null
                  ? null
                  : String(
                      courierName
                    ),
            }),
          });

      return res.status(200).json({
        success: true,
        message:
          "Order updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Update admin order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order",
      });
    }
  }
);

// =========================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// =========================================================

router.get(
  "/products",
  async (_req, res) => {
    try {
      const products =
        await db.orm.public.Product
          .orderBy(
            (product) =>
              product.createdAt.desc()
          )
          .all();

      return res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error(
        "Get admin products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch products",
      });
    }
  }
);

// =========================================================
// ACTIVATE / DEACTIVATE PRODUCT
// PATCH /api/admin/products/:id/status
// =========================================================

router.patch(
  "/products/:id/status",
  async (req, res) => {
    try {
      const productId =
        Number(req.params.id);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const { isActive } =
        req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }

      const existingProduct =
        await db.orm.public.Product
          .where({
            id: productId,
          })
          .first();

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const updatedProduct =
        await db.orm.public.Product
          .where({
            id: productId,
          })
          .update({
            isActive,
          });

      return res.status(200).json({
        success: true,

        message: isActive
          ? "Product activated successfully"
          : "Product deactivated successfully",

        data: updatedProduct,
      });
    } catch (error) {
      console.error(
        "Update admin product status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update product status",
      });
    }
  }
);

// =========================================================
// ADMIN REVIEWS
// =========================================================

// =========================================================
// GET ALL REVIEWS
// GET /api/admin/reviews
// =========================================================

router.get(
  "/reviews",
  async (_req, res) => {
    try {
      const reviews =
        await db.orm.public.Review
          .include("user")
          .include("product")
          .orderBy(
            (review) =>
              review.createdAt.desc()
          )
          .all();

      const formattedReviews =
        reviews.map(
          (review: any) => ({
            id: review.id,

            rating:
              review.rating,

            comment:
              review.comment,

            isApproved:
              review.isApproved,

            createdAt:
              review.createdAt,

            updatedAt:
              review.updatedAt,

            user: review.user
              ? {
                  id:
                    review.user.id,

                  name:
                    review.user.name,

                  username:
                    review.user.username,

                  email:
                    review.user.email,
                }
              : null,

            product:
              review.product
                ? {
                    id:
                      review.product.id,

                    name:
                      review.product.name,

                    image:
                      review.product.image,

                    category:
                      review.product.category,
                  }
                : null,
          })
        );

      return res.status(200).json({
        success: true,
        count:
          formattedReviews.length,
        data: formattedReviews,
      });
    } catch (error) {
      console.error(
        "Get admin reviews error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch reviews",
      });
    }
  }
);

// =========================================================
// GET SINGLE REVIEW
// GET /api/admin/reviews/:id
// =========================================================

router.get(
  "/reviews/:id",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (!Number.isInteger(reviewId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID",
        });
      }

      const review =
        await db.orm.public.Review
          .where({
            id: reviewId,
          })
          .include("user")
          .include("product")
          .first();

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error(
        "Get admin review error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch review",
      });
    }
  }
);

// =========================================================
// APPROVE / HIDE REVIEW
// PATCH /api/admin/reviews/:id/status
// =========================================================

router.patch(
  "/reviews/:id/status",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (!Number.isInteger(reviewId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID",
        });
      }

      const { isApproved } =
        req.body;

      if (
        typeof isApproved !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isApproved must be true or false",
        });
      }

      const existingReview =
        await db.orm.public.Review
          .where({
            id: reviewId,
          })
          .first();

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      const updatedReview =
        await db.orm.public.Review
          .where({
            id: reviewId,
          })
          .update({
            isApproved,
          });

      return res.status(200).json({
        success: true,

        message: isApproved
          ? "Review approved successfully"
          : "Review hidden successfully",

        data: updatedReview,
      });
    } catch (error) {
      console.error(
        "Update admin review status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update review status",
      });
    }
  }
);

// =========================================================
// DELETE REVIEW
// DELETE /api/admin/reviews/:id
// =========================================================

router.delete(
  "/reviews/:id",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (!Number.isInteger(reviewId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID",
        });
      }

      const existingReview =
        await db.orm.public.Review
          .where({
            id: reviewId,
          })
          .first();

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      await db.orm.public.Review
        .where({
          id: reviewId,
        })
        .delete();

      return res.status(200).json({
        success: true,
        message:
          "Review deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete admin review error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete review",
      });
    }
  }
);

// =========================================================
// REVIEW STATISTICS
// GET /api/admin/reviews/stats/summary
// =========================================================

router.get(
  "/reviews/stats/summary",
  async (_req, res) => {
    try {
      const reviews =
        await db.orm.public.Review.all();

      const statistics = {
        total: reviews.length,

        approved: 0,
        pending: 0,

        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,

        averageRating: 0,
      };

      let ratingTotal = 0;

      reviews.forEach(
        (review: any) => {
          const rating =
            Number(review.rating);

          if (review.isApproved) {
            statistics.approved++;
          } else {
            statistics.pending++;
          }

          if (
            Number.isFinite(rating)
          ) {
            ratingTotal += rating;

            switch (rating) {
              case 1:
                statistics.oneStar++;
                break;

              case 2:
                statistics.twoStar++;
                break;

              case 3:
                statistics.threeStar++;
                break;

              case 4:
                statistics.fourStar++;
                break;

              case 5:
                statistics.fiveStar++;
                break;
            }
          }
        }
      );

      if (reviews.length > 0) {
        statistics.averageRating =
          Number(
            (
              ratingTotal /
              reviews.length
            ).toFixed(1)
          );
      }

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error(
        "Admin review statistics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load review statistics",
      });
    }
  }
);

// =========================================================
// COUPONS
// =========================================================
//
// Coupon model:
//
// model Coupon {
//   id              Int      @id @default(autoincrement())
//   code            String   @unique
//   discountType    String
//   discountValue   Int
//   minimumAmount   Int      @default(0)
//   maximumDiscount Int?
//   usageLimit      Int?
//   usedCount       Int      @default(0)
//   expiresAt       TimestamptzString?
//   isActive        Boolean  @default(true)
//   createdAt       TimestamptzString @default(now())
//   updatedAt       temporal.updatedAtString()
// }

// =========================================================
// GET ALL COUPONS
// GET /api/admin/coupons
// =========================================================

router.get(
  "/coupons",
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
        "Get admin coupons error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch coupons",
      });
    }
  }
);

// =========================================================
// GET SINGLE COUPON
// GET /api/admin/coupons/:id
// =========================================================

router.get(
  "/coupons/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (!Number.isInteger(couponId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID",
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
            "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      console.error(
        "Get admin coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch coupon",
      });
    }
  }
);

// =========================================================
// CREATE COUPON
// POST /api/admin/coupons
// =========================================================
//
// Body:
//
// {
//   "code": "SAVE20",
//   "discountType": "PERCENTAGE",
//   "discountValue": 20,
//   "minimumAmount": 1000,
//   "maximumDiscount": 500,
//   "usageLimit": 100,
//   "expiresAt": "2026-12-31T23:59:59.000Z"
// }
//
// discountType:
// PERCENTAGE
// FIXED
//
// =========================================================

router.post(
  "/coupons",
  async (req, res) => {
    try {
      let {
        code,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        expiresAt,
        isActive,
      } = req.body;

      // -------------------------------------------------------
      // CODE
      // -------------------------------------------------------

      if (
        typeof code !== "string" ||
        !code.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code is required",
        });
      }

      code =
        code.trim().toUpperCase();

      // -------------------------------------------------------
      // DISCOUNT TYPE
      // -------------------------------------------------------

      if (
        typeof discountType !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount type is required",
        });
      }

      discountType =
        discountType
          .trim()
          .toUpperCase();

      if (
        ![
          "PERCENTAGE",
          "FIXED",
        ].includes(discountType)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount type must be PERCENTAGE or FIXED",
        });
      }

      // -------------------------------------------------------
      // DISCOUNT VALUE
      // -------------------------------------------------------

      const numericDiscount =
        Number(discountValue);

      if (
        !Number.isFinite(
          numericDiscount
        ) ||
        numericDiscount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount value must be greater than 0",
        });
      }

      if (
        discountType ===
          "PERCENTAGE" &&
        numericDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage discount cannot exceed 100",
        });
      }

      // -------------------------------------------------------
      // MINIMUM AMOUNT
      // -------------------------------------------------------

      const numericMinimum =
        minimumAmount ===
        undefined ||
        minimumAmount === null ||
        minimumAmount === ""
          ? 0
          : Number(minimumAmount);

      if (
        !Number.isFinite(
          numericMinimum
        ) ||
        numericMinimum < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum amount must be 0 or greater",
        });
      }

      // -------------------------------------------------------
      // MAXIMUM DISCOUNT
      // -------------------------------------------------------

      let numericMaximum:
        | number
        | null = null;

      if (
        maximumDiscount !==
          undefined &&
        maximumDiscount !==
          null &&
        maximumDiscount !== ""
      ) {
        numericMaximum =
          Number(
            maximumDiscount
          );

        if (
          !Number.isFinite(
            numericMaximum
          ) ||
          numericMaximum <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Maximum discount must be greater than 0",
          });
        }
      }

      // -------------------------------------------------------
      // USAGE LIMIT
      // -------------------------------------------------------

      let numericUsageLimit:
        | number
        | null = null;

      if (
        usageLimit !==
          undefined &&
        usageLimit !==
          null &&
        usageLimit !== ""
      ) {
        numericUsageLimit =
          Number(usageLimit);

        if (
          !Number.isInteger(
            numericUsageLimit
          ) ||
          numericUsageLimit <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Usage limit must be a positive integer",
          });
        }
      }

      // -------------------------------------------------------
      // EXPIRY
      // -------------------------------------------------------

      let parsedExpiresAt:
        | string
        | null = null;

      if (
        expiresAt !==
          undefined &&
        expiresAt !==
          null &&
        expiresAt !== ""
      ) {
        const date =
          new Date(expiresAt);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid expiry date",
          });
        }

        parsedExpiresAt =
          date.toISOString();
      }

      // -------------------------------------------------------
      // ACTIVE STATUS
      // -------------------------------------------------------

      const activeStatus =
        typeof isActive ===
        "boolean"
          ? isActive
          : true;

      // -------------------------------------------------------
      // CHECK DUPLICATE CODE
      // -------------------------------------------------------

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
            "A coupon with this code already exists",
        });
      }

      // -------------------------------------------------------
      // CREATE
      // -------------------------------------------------------

      const coupon =
        await db.orm.public.Coupon.create({
          code,

          discountType,

          discountValue:
            Math.round(
              numericDiscount
            ),

          minimumAmount:
            Math.round(
              numericMinimum
            ),

          maximumDiscount:
            numericMaximum === null
              ? null
              : Math.round(
                  numericMaximum
                ),

          usageLimit:
            numericUsageLimit,

          usedCount: 0,

          expiresAt:
            parsedExpiresAt,

          isActive:
            activeStatus,
        });

      return res.status(201).json({
        success: true,
        message:
          "Coupon created successfully",
        data: coupon,
      });
    } catch (error) {
      console.error(
        "Create admin coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create coupon",
      });
    }
  }
);

// =========================================================
// UPDATE COUPON
// PUT /api/admin/coupons/:id
// =========================================================

router.put(
  "/coupons/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (!Number.isInteger(couponId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID",
        });
      }

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
            "Coupon not found",
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
        isActive,
      } = req.body;

      const updateData: any = {};

      // -------------------------------------------------------
      // CODE
      // -------------------------------------------------------

      if (
        code !== undefined
      ) {
        if (
          typeof code !==
            "string" ||
          !code.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Coupon code cannot be empty",
          });
        }

        const normalizedCode =
          code
            .trim()
            .toUpperCase();

        const duplicateCoupon =
          await db.orm.public.Coupon
            .where({
              code:
                normalizedCode,
            })
            .first();

        if (
          duplicateCoupon &&
          duplicateCoupon.id !==
            couponId
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Another coupon with this code already exists",
          });
        }

        updateData.code =
          normalizedCode;
      }

      // -------------------------------------------------------
      // DISCOUNT TYPE
      // -------------------------------------------------------

      if (
        discountType !==
        undefined
      ) {
        if (
          typeof discountType !==
          "string"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid discount type",
          });
        }

        const normalizedType =
          discountType
            .trim()
            .toUpperCase();

        if (
          ![
            "PERCENTAGE",
            "FIXED",
          ].includes(
            normalizedType
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Discount type must be PERCENTAGE or FIXED",
          });
        }

        updateData.discountType =
          normalizedType;
      }

      // -------------------------------------------------------
      // DISCOUNT VALUE
      // -------------------------------------------------------

      if (
        discountValue !==
        undefined
      ) {
        const numericDiscount =
          Number(
            discountValue
          );

        if (
          !Number.isFinite(
            numericDiscount
          ) ||
          numericDiscount <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Discount value must be greater than 0",
          });
        }

        const typeToCheck =
          updateData.discountType ||
          existingCoupon.discountType;

        if (
          typeToCheck ===
            "PERCENTAGE" &&
          numericDiscount > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Percentage discount cannot exceed 100",
          });
        }

        updateData.discountValue =
          Math.round(
            numericDiscount
          );
      }

      // -------------------------------------------------------
      // MINIMUM AMOUNT
      // -------------------------------------------------------

      if (
        minimumAmount !==
        undefined
      ) {
        const numericMinimum =
          Number(
            minimumAmount
          );

        if (
          !Number.isFinite(
            numericMinimum
          ) ||
          numericMinimum < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Minimum amount must be 0 or greater",
          });
        }

        updateData.minimumAmount =
          Math.round(
            numericMinimum
          );
      }

      // -------------------------------------------------------
      // MAXIMUM DISCOUNT
      // -------------------------------------------------------

      if (
        maximumDiscount !==
        undefined
      ) {
        if (
          maximumDiscount ===
            null ||
          maximumDiscount ===
            ""
        ) {
          updateData.maximumDiscount =
            null;
        } else {
          const numericMaximum =
            Number(
              maximumDiscount
            );

          if (
            !Number.isFinite(
              numericMaximum
            ) ||
            numericMaximum <= 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Maximum discount must be greater than 0",
            });
          }

          updateData.maximumDiscount =
            Math.round(
              numericMaximum
            );
        }
      }

      // -------------------------------------------------------
      // USAGE LIMIT
      // -------------------------------------------------------

      if (
        usageLimit !==
        undefined
      ) {
        if (
          usageLimit ===
            null ||
          usageLimit ===
            ""
        ) {
          updateData.usageLimit =
            null;
        } else {
          const numericUsage =
            Number(
              usageLimit
            );

          if (
            !Number.isInteger(
              numericUsage
            ) ||
            numericUsage <= 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Usage limit must be a positive integer",
            });
          }

          if (
            numericUsage <
            Number(
              existingCoupon.usedCount
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Usage limit cannot be lower than the current used count",
            });
          }

          updateData.usageLimit =
            numericUsage;
        }
      }

      // -------------------------------------------------------
      // EXPIRY
      // -------------------------------------------------------

      if (
        expiresAt !==
        undefined
      ) {
        if (
          expiresAt ===
            null ||
          expiresAt ===
            ""
        ) {
          updateData.expiresAt =
            null;
        } else {
          const date =
            new Date(
              expiresAt
            );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid expiry date",
            });
          }

          updateData.expiresAt =
            date.toISOString();
        }
      }

      // -------------------------------------------------------
      // ACTIVE STATUS
      // -------------------------------------------------------

      if (
        isActive !==
        undefined
      ) {
        if (
          typeof isActive !==
          "boolean"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "isActive must be true or false",
          });
        }

        updateData.isActive =
          isActive;
      }

      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      const updatedCoupon =
        await db.orm.public.Coupon
          .where({
            id: couponId,
          })
          .update(
            updateData
          );

      return res.status(200).json({
        success: true,
        message:
          "Coupon updated successfully",
        data: updatedCoupon,
      });
    } catch (error) {
      console.error(
        "Update admin coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update coupon",
      });
    }
  }
);

// =========================================================
// ACTIVATE / DEACTIVATE COUPON
// PATCH /api/admin/coupons/:id/status
// =========================================================

router.patch(
  "/coupons/:id/status",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (!Number.isInteger(couponId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID",
        });
      }

      const { isActive } =
        req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }

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
            "Coupon not found",
        });
      }

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
          ? "Coupon activated successfully"
          : "Coupon deactivated successfully",

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
          "Failed to update coupon status",
      });
    }
  }
);

// =========================================================
// DELETE COUPON
// DELETE /api/admin/coupons/:id
// =========================================================

router.delete(
  "/coupons/:id",
  async (req, res) => {
    try {
      const couponId =
        Number(req.params.id);

      if (!Number.isInteger(couponId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon ID",
        });
      }

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
            "Coupon not found",
        });
      }

      await db.orm.public.Coupon
        .where({
          id: couponId,
        })
        .delete();

      return res.status(200).json({
        success: true,
        message:
          "Coupon deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete admin coupon error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete coupon",
      });
    }
  }
);

// =========================================================
// COUPON STATISTICS
// GET /api/admin/coupons/stats/summary
// =========================================================

router.get(
  "/coupons/stats/summary",
  async (_req, res) => {
    try {
      const coupons =
        await db.orm.public.Coupon.all();

      const statistics = {
        total: coupons.length,

        active: 0,
        inactive: 0,

        expired: 0,
        neverExpires: 0,

        percentageCoupons: 0,
        fixedCoupons: 0,

        totalUses: 0,
      };

      const now =
        new Date();

      coupons.forEach(
        (coupon: any) => {
          // -------------------------------------------------
          // ACTIVE
          // -------------------------------------------------

          if (coupon.isActive) {
            statistics.active++;
          } else {
            statistics.inactive++;
          }

          // -------------------------------------------------
          // EXPIRY
          // -------------------------------------------------

          if (
            coupon.expiresAt
          ) {
            const expiry =
              new Date(
                coupon.expiresAt
              );

            if (
              !Number.isNaN(
                expiry.getTime()
              ) &&
              expiry < now
            ) {
              statistics.expired++;
            }
          } else {
            statistics.neverExpires++;
          }

          // -------------------------------------------------
          // DISCOUNT TYPE
          // -------------------------------------------------

          const type =
            String(
              coupon.discountType ||
                ""
            ).toUpperCase();

          if (
            type ===
            "PERCENTAGE"
          ) {
            statistics.percentageCoupons++;
          }

          if (
            type === "FIXED"
          ) {
            statistics.fixedCoupons++;
          }

          // -------------------------------------------------
          // TOTAL USES
          // -------------------------------------------------

          statistics.totalUses +=
            Number(
              coupon.usedCount
            ) || 0;
        }
      );

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error(
        "Admin coupon statistics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load coupon statistics",
      });
    }
  }
);

// =========================================================
// EXPORT ROUTER
// =========================================================

export default router;