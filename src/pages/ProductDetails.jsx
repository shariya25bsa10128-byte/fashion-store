import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  Star,
  Check,
  MessageCircle,
} from "lucide-react";

import products from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:5000/api";

// =========================================================
// WHATSAPP NUMBER
// =========================================================

const WHATSAPP_NUMBER = "916393142558";

function ProductDetails() {
  const { id } = useParams();

  // =========================================================
  // PRODUCT
  // =========================================================

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const {
    user,
    token,
    isLoggedIn,
  } = useAuth();

  // =========================================================
  // PRODUCT STATE
  // =========================================================

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // =========================================================
  // REVIEW STATE
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] =
    useState("");

  // =========================================================
  // SIZE OPTIONS
  // =========================================================

  const sizes =
    product?.category === "Kids"
      ? [
          "2-3Y",
          "4-5Y",
          "6-7Y",
          "8-10Y",
          "10-12Y",
        ]
      : [
          "S",
          "M",
          "L",
          "XL",
          "XXL",
        ];

  // =========================================================
  // COLOR OPTIONS
  // =========================================================

  const colors =
    Array.isArray(product?.colors) &&
    product.colors.length > 0
      ? product.colors
      : [
          "Black",
          "White",
          "Beige",
          "Blue",
          "Red",
        ];

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    loadReviews();
  }, [product?.id]);

  // =========================================================
  // LOAD REVIEWS FUNCTION
  // =========================================================

  const loadReviews = async () => {
    if (!product?.id) {
      return;
    }

    try {
      setReviewsLoading(true);
      setReviewError("");

      const response = await fetch(
        `${API_BASE_URL}/reviews/product/${product.id}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load reviews."
        );
      }

      setReviews(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "LOAD REVIEWS ERROR:",
        error
      );

      setReviewError(
        error.message ||
          "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  // =========================================================
  // PRODUCT NOT FOUND
  // =========================================================

  if (!product) {
    return (
      <main className="product-not-found">
        <h1>
          Product Not Found
        </h1>

        <p>
          Sorry, we couldn't find the product
          you're looking for.
        </p>

        <Link to="/">
          <ArrowLeft size={16} />
          BACK TO HOME
        </Link>
      </main>
    );
  }

  // =========================================================
  // WISHLIST
  // =========================================================

  const saved =
    isInWishlist(product.id);

  // =========================================================
  // REVIEW STATISTICS
  // =========================================================

  const reviewCount =
    reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce(
          (total, review) =>
            total +
            Number(
              review.rating || 0
            ),
          0
        ) / reviewCount
      : 0;

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleSubmitReview = async () => {
    setReviewError("");
    setReviewSuccess("");

    // -------------------------------------------------------
    // LOGIN CHECK
    // -------------------------------------------------------

    if (!isLoggedIn || !user?.id) {
      setReviewError(
        "Please sign in to write a review."
      );

      return;
    }

    // -------------------------------------------------------
    // TOKEN CHECK
    // -------------------------------------------------------

    if (!token) {
      setReviewError(
        "Your login session has expired. Please sign in again."
      );

      return;
    }

    // -------------------------------------------------------
    // RATING VALIDATION
    // -------------------------------------------------------

    if (
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setReviewError(
        "Please select a rating."
      );

      return;
    }

    // -------------------------------------------------------
    // COMMENT VALIDATION
    // -------------------------------------------------------

    const trimmedComment =
      reviewComment.trim();

    if (!trimmedComment) {
      setReviewError(
        "Please write a review."
      );

      return;
    }

    if (
      trimmedComment.length > 1000
    ) {
      setReviewError(
        "Review cannot exceed 1000 characters."
      );

      return;
    }

    // -------------------------------------------------------
    // SUBMIT REVIEW
    // -------------------------------------------------------

    try {
      setReviewSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/reviews/product/${product.id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            rating: selectedRating,
            comment: trimmedComment,
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "SUBMIT REVIEW RESPONSE:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to submit review."
        );
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setReviewSuccess(
        "Your review has been submitted successfully."
      );

      setSelectedRating(0);
      setReviewComment("");

      // -----------------------------------------------------
      // RELOAD REVIEWS
      // -----------------------------------------------------

      await loadReviews();
    } catch (error) {
      console.error(
        "SUBMIT REVIEW ERROR:",
        error
      );

      setReviewError(
        error.message ||
          "Unable to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================================================
  // QUANTITY
  // =========================================================

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1
        ? current - 1
        : 1
    );
  };

  const increaseQuantity = () => {
    setQuantity(
      (current) => current + 1
    );
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = () => {
    // -------------------------------------------------------
    // SIZE CHECK
    // -------------------------------------------------------

    if (!selectedSize) {
      alert(
        "Please select a size."
      );

      return;
    }

    // -------------------------------------------------------
    // COLOR CHECK
    // -------------------------------------------------------

    if (!selectedColor) {
      alert(
        "Please select a color."
      );

      return;
    }

    // -------------------------------------------------------
    // ADD PRODUCT
    // -------------------------------------------------------

    addToCart(
      {
        ...product,

        selectedSize:
          selectedSize,

        selectedColor:
          selectedColor,
      },
      quantity
    );

    // -------------------------------------------------------
    // RESET QUANTITY
    // -------------------------------------------------------

    setQuantity(1);
  };

  // =========================================================
  // WHATSAPP ORDER
  // =========================================================

  const handleWhatsAppOrder = () => {
    // -------------------------------------------------------
    // SIZE CHECK
    // -------------------------------------------------------

    if (!selectedSize) {
      alert(
        "Please select a size."
      );

      return;
    }

    // -------------------------------------------------------
    // COLOR CHECK
    // -------------------------------------------------------

    if (!selectedColor) {
      alert(
        "Please select a color."
      );

      return;
    }

    // -------------------------------------------------------
    // CALCULATE TOTAL
    // -------------------------------------------------------

    const totalPrice =
      product.price * quantity;

    // -------------------------------------------------------
    // CREATE WHATSAPP MESSAGE
    // -------------------------------------------------------

    const message = `Hello FashionStore! 👋

I would like to order:

🛍️ Product: ${product.name}
📂 Category: ${product.category}
📏 Size: ${selectedSize}
🎨 Color: ${selectedColor}
🔢 Quantity: ${quantity}

💰 Price: ₹${product.price.toLocaleString(
      "en-IN"
    )}
💵 Total: ₹${totalPrice.toLocaleString(
      "en-IN"
    )}

Please confirm my order and let me know the next steps. Thank you!`;

    // -------------------------------------------------------
    // CREATE WHATSAPP URL
    // -------------------------------------------------------

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;

    // -------------------------------------------------------
    // OPEN WHATSAPP
    // -------------------------------------------------------

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // WISHLIST
  // =========================================================

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  // =========================================================
  // REVIEW DATE
  // =========================================================

  const formatReviewDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // RENDER STARS
  // =========================================================

  const renderStars = (
    rating,
    interactive = false
  ) => {
    const numericRating =
      Number(rating) || 0;

    return (
      <div className="product-review-stars">
        {[1, 2, 3, 4, 5].map(
          (starNumber) => (
            <button
              key={starNumber}
              type="button"
              className={
                interactive
                  ? "review-star-button"
                  : "review-star"
              }
              onClick={
                interactive
                  ? () =>
                      setSelectedRating(
                        starNumber
                      )
                  : undefined
              }
              disabled={
                !interactive
              }
              aria-label={
                interactive
                  ? `Rate ${starNumber} stars`
                  : undefined
              }
            >
              <Star
                size={18}
                fill={
                  starNumber <=
                  numericRating
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          )
        )}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <Link
          to={`/${product.category.toLowerCase()}`}
          className="back-to-category"
        >
          <ArrowLeft size={16} />

          BACK TO{" "}
          {product.category.toUpperCase()}
        </Link>

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <div className="product-details">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div className="product-details-image">

            <div className="product-details-image-wrapper">

              <img
                src={product.image}
                alt={product.name}
              />

              {product.badge && (
                <span className="product-details-badge">
                  {product.badge}
                </span>
              )}

            </div>

          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="product-details-info">

            <p className="product-details-category">
              {product.category}
            </p>

            <h1>
              {product.name}
            </h1>

            {/* =================================================
                PRICE
            ================================================= */}

            <div className="product-details-price">

              <span>
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </span>

              {product.oldPrice && (
                <del>
                  ₹
                  {product.oldPrice.toLocaleString(
                    "en-IN"
                  )}
                </del>
              )}

              {product.oldPrice && (
                <small>
                  SALE
                </small>
              )}

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p className="product-description">
              A thoughtfully designed piece
              made for everyday style and
              comfort. Crafted with quality
              materials and an effortless
              silhouette, this piece is perfect
              for building a versatile wardrobe.
            </p>

            {/* =================================================
                SIZE
            ================================================= */}

            <div className="product-option">

              <div className="option-heading">

                <span>
                  SELECT SIZE
                </span>

                <button
                  type="button"
                  className="size-guide-button"
                >
                  SIZE GUIDE
                </button>

              </div>

              <div className="size-options">

                {sizes.map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      className={
                        selectedSize ===
                        size
                          ? "size-option selected"
                          : "size-option"
                      }
                      onClick={() =>
                        setSelectedSize(
                          size
                        )
                      }
                    >
                      {size}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* =================================================
                COLOR
            ================================================= */}

            <div className="product-option">

              <div className="option-heading">

                <span>
                  SELECT COLOR
                </span>

                {selectedColor && (
                  <strong className="selected-color-name">
                    {selectedColor}
                  </strong>
                )}

              </div>

              <div className="color-options">

                {colors.map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        selectedColor ===
                        color
                          ? "color-option selected"
                          : "color-option"
                      }
                      onClick={() =>
                        setSelectedColor(
                          color
                        )
                      }
                    >
                      <span>
                        {color}
                      </span>

                      {selectedColor ===
                        color && (
                        <Check
                          size={14}
                        />
                      )}

                    </button>
                  )
                )}

              </div>

            </div>

            {/* =================================================
                QUANTITY
            ================================================= */}

            <div className="product-option">

              <div className="option-heading">

                <span>
                  QUANTITY
                </span>

              </div>

              <div className="quantity-selector">

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>

              </div>

            </div>

            {/* =================================================
                ADD TO BAG
            ================================================= */}

            <button
              type="button"
              className="product-add-btn"
              onClick={
                handleAddToCart
              }
            >
              <ShoppingBag size={18} />

              ADD TO BAG
            </button>

            {/* =================================================
                ORDER ON WHATSAPP
            ================================================= */}

            <button
              type="button"
              className="product-whatsapp-btn"
              onClick={
                handleWhatsAppOrder
              }
            >
              <MessageCircle size={18} />

              ORDER ON WHATSAPP
            </button>

            {/* =================================================
                WISHLIST
            ================================================= */}

            <button
              type="button"
              className={
                saved
                  ? "product-wishlist-btn saved"
                  : "product-wishlist-btn"
              }
              onClick={
                handleWishlist
              }
            >
              <Heart
                size={18}
                fill={
                  saved
                    ? "currentColor"
                    : "none"
                }
              />

              {saved
                ? "SAVED TO WISHLIST"
                : "ADD TO WISHLIST"}

            </button>

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div className="product-extra-details">

              <div>

                <strong>
                  CATEGORY
                </strong>

                <span>
                  {product.category}
                </span>

              </div>

              <div>

                <strong>
                  DELIVERY
                </strong>

                <span>
                  Free delivery on orders
                  above ₹999
                </span>

              </div>

              <div>

                <strong>
                  RETURNS
                </strong>

                <span>
                  Easy 7-day returns
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="product-reviews-section">

          {/* =================================================
              REVIEW HEADER
          ================================================= */}

          <div className="product-reviews-header">

            <div>

              <p className="product-reviews-eyebrow">
                CUSTOMER FEEDBACK
              </p>

              <h2>
                Reviews
              </h2>

            </div>

            <div className="product-review-summary">

              <div className="product-review-average">
                {averageRating.toFixed(1)}
              </div>

              <div>

                {renderStars(
                  Math.round(
                    averageRating
                  )
                )}

                <span>
                  {reviewCount}{" "}
                  {reviewCount === 1
                    ? "review"
                    : "reviews"}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {reviewError && (
            <div className="product-review-message error">
              {reviewError}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {reviewSuccess && (
            <div className="product-review-message success">
              {reviewSuccess}
            </div>
          )}

          {/* =================================================
              WRITE REVIEW
          ================================================= */}

          <div className="product-write-review">

            {!isLoggedIn ? (

              <div className="product-review-login-message">

                <p>
                  Please sign in to share
                  your experience.
                </p>

                <Link to="/login">
                  SIGN IN TO WRITE A REVIEW
                </Link>

              </div>

            ) : (

              <>

                <div>

                  <p className="product-reviews-eyebrow">
                    SHARE YOUR EXPERIENCE
                  </p>

                  <h3>
                    Write a Review
                  </h3>

                </div>

                {/* =================================================
                    RATING
                ================================================= */}

                <div className="product-review-form-group">

                  <label>
                    YOUR RATING
                  </label>

                  <div className="product-review-rating-input">

                    {renderStars(
                      selectedRating,
                      true
                    )}

                  </div>

                </div>

                {/* =================================================
                    COMMENT
                ================================================= */}

                <div className="product-review-form-group">

                  <label htmlFor="review-comment">
                    YOUR REVIEW
                  </label>

                  <textarea
                    id="review-comment"
                    rows="5"
                    maxLength={1000}
                    placeholder="Tell us what you think about this product..."
                    value={
                      reviewComment
                    }
                    onChange={(
                      event
                    ) =>
                      setReviewComment(
                        event.target.value
                      )
                    }
                    disabled={
                      reviewSubmitting
                    }
                  />

                  <small>
                    {
                      reviewComment.length
                    }
                    /1000
                  </small>

                </div>

                {/* =================================================
                    SUBMIT REVIEW
                ================================================= */}

                <button
                  type="button"
                  className="product-review-submit"
                  onClick={
                    handleSubmitReview
                  }
                  disabled={
                    reviewSubmitting
                  }
                >
                  {reviewSubmitting
                    ? "SUBMITTING..."
                    : "SUBMIT REVIEW"}
                </button>

              </>

            )}

          </div>

          {/* =================================================
              CUSTOMER REVIEWS
          ================================================= */}

          <div className="product-reviews-list">

            <div className="product-reviews-list-header">

              <h3>
                Customer Reviews
              </h3>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {reviewsLoading ? (

              <div className="product-reviews-empty">

                <p>
                  LOADING REVIEWS...
                </p>

              </div>

            ) : reviews.length === 0 ? (

              <div className="product-reviews-empty">

                <Star size={28} />

                <h3>
                  No reviews yet
                </h3>

                <p>
                  Be the first to review
                  this product.
                </p>

              </div>

            ) : (

              reviews.map(
                (review) => (

                  <article
                    className="product-review-card"
                    key={review.id}
                  >

                    <div className="product-review-card-header">

                      <div>

                        <strong>
                          {review.user?.name ||
                            "Customer"}
                        </strong>

                        <span>
                          {formatReviewDate(
                            review.createdAt
                          )}
                        </span>

                      </div>

                      {renderStars(
                        Number(
                          review.rating
                        ) || 0
                      )}

                    </div>

                    {review.comment && (
                      <p>
                        {review.comment}
                      </p>
                    )}

                  </article>

                )
              )

            )}

          </div>

        </section>

      </div>

    </main>
  );
}

export default ProductDetails;