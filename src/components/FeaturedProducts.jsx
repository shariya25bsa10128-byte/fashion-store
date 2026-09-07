import React from "react";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import products from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function FeaturedProducts() {
  const { addToWishlist, isInWishlist } =
    useWishlist();

  const { addToCart } = useCart();

  const featuredProducts = products.slice(0, 8);

  const handleWishlist = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    addToWishlist(product);
  };

  const handleAddToCart = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart(product);
  };

  return (
    <section className="featured-products">

      {/* =====================================
          SECTION HEADER
      ===================================== */}

      <div className="featured-header">

        <div>

          <span className="section-label">
            CURATED FOR YOU
          </span>

          <h2>
            Featured Products
          </h2>

          <p>
            Discover our most loved pieces,
            selected just for you.
          </p>

        </div>

        <Link
          to="/new-arrivals"
          className="view-all-link"
        >
          VIEW ALL
          <ArrowRight size={18} />
        </Link>

      </div>

      {/* =====================================
          PRODUCT GRID
      ===================================== */}

      <div className="featured-products-grid">

        {featuredProducts.map((product) => {

          const wishlistActive =
            isInWishlist(product.id);

          return (
            <article
              className="featured-product-card"
              key={product.id}
            >

              {/* =================================
                  PRODUCT IMAGE
              ================================= */}

              <div className="featured-product-image">

                <Link
                  to={`/product/${product.id}`}
                >

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />

                </Link>

                {/* BADGE */}

                {product.badge && (
                  <span className="product-badge">
                    {product.badge}
                  </span>
                )}

                {/* WISHLIST */}

                <button
                  type="button"
                  className={
                    wishlistActive
                      ? "product-wishlist active"
                      : "product-wishlist"
                  }
                  onClick={(event) =>
                    handleWishlist(
                      event,
                      product
                    )
                  }
                  aria-label={
                    wishlistActive
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >

                  <Heart
                    size={21}
                    fill={
                      wishlistActive
                        ? "currentColor"
                        : "none"
                    }
                  />

                </button>

              </div>

              {/* =================================
                  PRODUCT INFORMATION
              ================================= */}

              <div className="featured-product-info">

                <span className="product-category">
                  {product.category}
                </span>

                <Link
                  to={`/product/${product.id}`}
                  className="product-name"
                >
                  {product.name}
                </Link>

                {/* PRICE */}

                <div className="product-price">

                  <span className="current-price">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </span>

                  {product.oldPrice && (
                    <span className="old-price">
                      ₹
                      {Number(
                        product.oldPrice
                      ).toLocaleString("en-IN")}
                    </span>
                  )}

                </div>

                {/* ADD TO CART */}

                <button
                  type="button"
                  className="product-add-cart"
                  onClick={(event) =>
                    handleAddToCart(
                      event,
                      product
                    )
                  }
                >

                  <ShoppingBag size={15} />

                  <span>
                    ADD TO CART
                  </span>

                </button>

              </div>

            </article>
          );
        })}

      </div>

    </section>
  );
}

export default FeaturedProducts;