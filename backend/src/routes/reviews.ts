import { Router } from "express";

import { db } from "../prisma/db";

import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

// =========================================================
// GET REVIEWS FOR PRODUCT
// GET /api/reviews/product/:productId
//
// Only approved reviews are returned to customers.
// =========================================================

router.get(
  "/product/:productId",
  async (req, res) => {
    try {
      const productId =
        Number(req.params.productId);

      // -----------------------------------------------------
      // VALIDATE PRODUCT ID
      // -----------------------------------------------------

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      // -----------------------------------------------------
      // CHECK PRODUCT
      // -----------------------------------------------------

      const product =
        await db.orm.public.Product
          .where({
            id: productId,
          })
          .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // -----------------------------------------------------
      // GET APPROVED REVIEWS
      // -----------------------------------------------------

      const reviews =
        await db.orm.public.Review
          .where({
            productId,
            isApproved: true,
          })
          .include("user")
          .orderBy(
            (review) =>
              review.createdAt.desc()
          )
          .all();

      // -----------------------------------------------------
      // SAFE REVIEW DATA
      // -----------------------------------------------------

      const safeReviews =
        reviews.map((review: any) => ({
          id: review.id,

          productId:
            review.productId,

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
              }
            : null,
        }));

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,

        count:
          safeReviews.length,

        data:
          safeReviews,
      });

    } catch (error) {
      console.error(
        "Get product reviews error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load product reviews",
      });
    }
  }
);


// =========================================================
// CREATE REVIEW
// POST /api/reviews/product/:productId
//
// Authentication required.
//
// User ID comes from the JWT.
// We DO NOT trust userId sent by the frontend.
// =========================================================

router.post(
  "/product/:productId",

  authMiddleware,

  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      // -----------------------------------------------------
      // PRODUCT ID
      // -----------------------------------------------------

      const productId =
        Number(req.params.productId);

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      // -----------------------------------------------------
      // AUTHENTICATED USER
      // -----------------------------------------------------

      const userId =
        req.user?.userId;

      if (
        !userId ||
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user information is missing.",
        });
      }

      // -----------------------------------------------------
      // RATING
      // -----------------------------------------------------

      const rating =
        Number(req.body.rating);

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5",
        });
      }

      // -----------------------------------------------------
      // COMMENT
      // -----------------------------------------------------

      const comment =
        typeof req.body.comment === "string"
          ? req.body.comment.trim()
          : "";

      if (!comment) {
        return res.status(400).json({
          success: false,
          message:
            "Review comment is required",
        });
      }

      if (comment.length > 1000) {
        return res.status(400).json({
          success: false,
          message:
            "Review cannot exceed 1000 characters",
        });
      }

      // -----------------------------------------------------
      // CHECK PRODUCT
      // -----------------------------------------------------

      const product =
        await db.orm.public.Product
          .where({
            id: productId,
          })
          .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // -----------------------------------------------------
      // CHECK USER
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // CHECK EXISTING REVIEW
      // -----------------------------------------------------

      const existingReview =
        await db.orm.public.Review
          .where({
            productId,
            userId,
          })
          .first();

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this product",
        });
      }

      // -----------------------------------------------------
      // CREATE REVIEW
      // -----------------------------------------------------

      const review =
        await db.orm.public.Review.create({
          productId,

          userId,

          rating,

          comment,

          // -------------------------------------------------
          // IMPORTANT
          //
          // New reviews are approved automatically for now.
          //
          // Later, when we build the Admin Reviews system,
          // we can change this to false so admins approve
          // reviews manually.
          // -------------------------------------------------

          isApproved: true,
        });

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          "Review submitted successfully",

        data: {
          id:
            review.id,

          productId:
            review.productId,

          userId:
            review.userId,

          rating:
            review.rating,

          comment:
            review.comment,

          isApproved:
            review.isApproved,

          createdAt:
            review.createdAt,
        },
      });

    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to submit review",
      });
    }
  }
);


// =========================================================
// GET ALL REVIEWS FOR ADMIN
// GET /api/reviews/admin/reviews
// =========================================================
//
// NOTE:
// These are currently accessible without admin middleware.
// We will secure them properly when we build the complete
// Admin Reviews system.
// =========================================================

router.get(
  "/admin/reviews",
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

      // -----------------------------------------------------
      // SAFE ADMIN REVIEW DATA
      // -----------------------------------------------------

      const safeReviews =
        reviews.map((review: any) => ({
          id:
            review.id,

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
                }
              : null,
        }));

      return res.status(200).json({
        success: true,

        count:
          safeReviews.length,

        data:
          safeReviews,
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
// GET SINGLE REVIEW FOR ADMIN
// GET /api/reviews/admin/reviews/:id
// =========================================================

router.get(
  "/admin/reviews/:id",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(reviewId) ||
        reviewId <= 0
      ) {
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

        data: {
          id:
            review.id,

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

          user:
            review.user
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
                }
              : null,
        },
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
// APPROVE / REJECT REVIEW
// PATCH /api/reviews/admin/reviews/:id/approval
// =========================================================

router.patch(
  "/admin/reviews/:id/approval",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(reviewId) ||
        reviewId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID",
        });
      }

      const {
        isApproved,
      } = req.body;

      // -----------------------------------------------------
      // VALIDATE APPROVAL VALUE
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // FIND REVIEW
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // UPDATE APPROVAL
      // -----------------------------------------------------

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

        message:
          isApproved
            ? "Review approved successfully"
            : "Review rejected successfully",

        data:
          updatedReview,
      });

    } catch (error) {
      console.error(
        "Update review approval error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update review approval",
      });
    }
  }
);


// =========================================================
// DELETE REVIEW
// DELETE /api/reviews/admin/reviews/:id
// =========================================================

router.delete(
  "/admin/reviews/:id",
  async (req, res) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(reviewId) ||
        reviewId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID",
        });
      }

      // -----------------------------------------------------
      // FIND REVIEW
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // DELETE
      // -----------------------------------------------------

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
        "Delete review error:",
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
// GET /api/reviews/admin/reviews/stats/summary
// =========================================================

router.get(
  "/admin/reviews/stats/summary",
  async (_req, res) => {
    try {
      const reviews =
        await db.orm.public.Review.all();

      const statistics = {
        total: reviews.length,

        approved: 0,

        pending: 0,

        fiveStar: 0,

        fourStar: 0,

        threeStar: 0,

        twoStar: 0,

        oneStar: 0,

        averageRating: 0,
      };

      let ratingTotal = 0;

      // -----------------------------------------------------
      // CALCULATE STATISTICS
      // -----------------------------------------------------

      reviews.forEach(
        (review: any) => {
          const rating =
            Number(review.rating);

          // Approval
          if (review.isApproved) {
            statistics.approved++;
          } else {
            statistics.pending++;
          }

          // Rating
          if (
            Number.isFinite(rating)
          ) {
            ratingTotal += rating;

            switch (rating) {
              case 5:
                statistics.fiveStar++;
                break;

              case 4:
                statistics.fourStar++;
                break;

              case 3:
                statistics.threeStar++;
                break;

              case 2:
                statistics.twoStar++;
                break;

              case 1:
                statistics.oneStar++;
                break;

              default:
                break;
            }
          }
        }
      );

      // -----------------------------------------------------
      // AVERAGE
      // -----------------------------------------------------

      if (reviews.length > 0) {
        statistics.averageRating =
          Number(
            (
              ratingTotal /
              reviews.length
            ).toFixed(2)
          );
      }

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,

        data:
          statistics,
      });

    } catch (error) {
      console.error(
        "Review statistics error:",
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
// EXPORT
// =========================================================

export default router;