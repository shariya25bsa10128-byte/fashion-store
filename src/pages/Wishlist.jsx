import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Wishlist() {
  const { addToCart } = useCart();

  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (wishlistItems.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="empty-wishlist">

          <Heart
            size={52}
            strokeWidth={1.3}
          />

          <h1>Your Wishlist Is Empty</h1>

          <p>
            Save your favorite styles here and
            come back to them anytime.
          </p>

          <Link
            to="/"
            className="continue-shopping-btn"
          >
            EXPLORE COLLECTION
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">

      <div className="wishlist-container">

        {/* Header */}

        <div className="wishlist-header">

          <div>
            <p className="wishlist-eyebrow">
              SAVED FOR LATER
            </p>

            <h1>My Wishlist</h1>
          </div>

          <span>
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1
              ? "ITEM"
              : "ITEMS"}
          </span>

        </div>

        {/* Products */}

        <div className="wishlist-grid">

          {wishlistItems.map((product) => (

            <article
              className="wishlist-card"
              key={product.id}
            >

              <div className="wishlist-image-wrapper">

                <img
                  src={product.image}
                  alt={product.name}
                />

                {product.badge && (
                  <span className="product-badge">
                    {product.badge}
                  </span>
                )}

                <button
                  className="wishlist-remove"
                  onClick={() =>
                    removeFromWishlist(product.id)
                  }
                  aria-label="Remove from wishlist"
                >
                  <Heart
                    size={18}
                    fill="currentColor"
                  />
                </button>

              </div>

              <div className="wishlist-product-info">

                <p className="product-category">
                  {product.category}
                </p>

                <h2>{product.name}</h2>

                <div className="wishlist-price">

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

                <button
                  className="wishlist-add-btn"
                  onClick={() =>
                    handleAddToCart(product)
                  }
                >
                  <ShoppingBag size={16} />
                  ADD TO BAG
                </button>

                <button
                  className="wishlist-delete-btn"
                  onClick={() =>
                    removeFromWishlist(product.id)
                  }
                >
                  <Trash2 size={14} />
                  REMOVE
                </button>

              </div>

            </article>

          ))}

        </div>

      </div>

    </main>
  );
}

export default Wishlist;