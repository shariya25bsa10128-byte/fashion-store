import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const saved = isInWishlist(product.id);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart(product);
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist(product);
  };

  return (
    <article className="product-card">

      <Link
        to={`/product/${product.id}`}
        className="product-card-link"
      >

        <div className="product-image-wrapper">

          <img
            src={product.image}
            alt={product.name}
          />

          {product.badge && (
            <span className="product-badge">
              {product.badge}
            </span>
          )}

          {/* WISHLIST */}

          <button
            className={`wishlist-btn ${
              saved ? "wishlist-active" : ""
            }`}
            onClick={handleWishlist}
            aria-label={
              saved
                ? "Remove from wishlist"
                : "Add to wishlist"
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
          </button>

          {/* QUICK ADD */}

          <button
            className="quick-add"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={16} />
            ADD TO BAG
          </button>

        </div>

        <div className="product-info">

          <p className="product-category">
            {product.category}
          </p>

          <h3>
            {product.name}
          </h3>

          <div className="product-price">

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

          </div>

        </div>

      </Link>

    </article>
  );
}

export default ProductCard;