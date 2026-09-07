import { useState } from "react";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

import products from "../data/products";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const { user, isLoggedIn, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================================
     SEARCH RESULTS
  ========================================= */

  const filteredProducts =
    searchQuery.trim() === ""
      ? []
      : products.filter((product) => {
          const query = searchQuery.toLowerCase();

          return (
            product.name
              ?.toLowerCase()
              .includes(query) ||
            product.category
              ?.toLowerCase()
              .includes(query) ||
            product.subcategory
              ?.toLowerCase()
              .includes(query) ||
            product.description
              ?.toLowerCase()
              .includes(query)
          );
        });

  /* =========================================
     CLOSE MOBILE MENU
  ========================================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* =========================================
     CLOSE SEARCH
  ========================================= */

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  /* =========================================
     OPEN PRODUCT
  ========================================= */

  const openProduct = (id) => {
    closeSearch();
    navigate(`/product/${id}`);
  };

  /* =========================================
     SEARCH KEYBOARD
  ========================================= */

  const handleSearchKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      filteredProducts.length > 0
    ) {
      openProduct(filteredProducts[0].id);
    }

    if (event.key === "Escape") {
      closeSearch();
    }
  };

  /* =========================================
     ACCOUNT
  ========================================= */

  const handleAccountClick = () => {
    closeMenu();

    if (isLoggedIn) {
      navigate("/account");
    } else {
      navigate("/login");
    }
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <>
      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="navbar">

        <div className="navbar-container">

          {/* =================================
              LOGO
          ================================= */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={closeMenu}
          >
            <strong>FASHION</strong>
            <span>STORE</span>
          </Link>

          {/* =================================
              DESKTOP NAVIGATION
          ================================= */}

          <nav className="navbar-links">

            <Link to="/">
              HOME
            </Link>

            <Link to="/men">
              MEN
            </Link>

            <Link to="/women">
              WOMEN
            </Link>

            <Link to="/kids">
              KIDS
            </Link>

            <Link to="/new-arrivals">
              NEW ARRIVALS
            </Link>

            <Link
              to="/sale"
              className="sale-link"
            >
              SALE
            </Link>

          </nav>

          {/* =================================
              ACTIONS
          ================================= */}

          <div className="navbar-actions">

            {/* SEARCH */}

            <button
              onClick={() =>
                setSearchOpen(true)
              }
              aria-label="Search"
            >
              <Search size={24} />
            </button>

            {/* ACCOUNT */}

            <button
              onClick={handleAccountClick}
              aria-label={
                isLoggedIn
                  ? "My Account"
                  : "Login"
              }
              title={
                isLoggedIn
                  ? `Hi, ${user?.name || user?.username || "Account"}`
                  : "Login"
              }
            >
              <UserRound size={24} />
            </button>

            {/* WISHLIST */}

            <Link
              to="/wishlist"
              className="icon-with-count"
              aria-label="Wishlist"
            >
              <Heart
                size={24}
                fill={
                  wishlistCount > 0
                    ? "currentColor"
                    : "none"
                }
              />

              {wishlistCount > 0 && (
                <span className="nav-count">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              to="/cart"
              className="icon-with-count"
              aria-label="Cart"
            >
              <ShoppingBag size={24} />

              {cartCount > 0 && (
                <span className="nav-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* MOBILE MENU */}

            <button
              className="mobile-menu-btn"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              aria-label="Menu"
            >
              {menuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>

          </div>

        </div>

      </header>

      {/* =======================================
          MOBILE MENU
      ======================================= */}

      {menuOpen && (
        <div className="mobile-menu">

          <Link
            to="/"
            onClick={closeMenu}
          >
            HOME
          </Link>

          <Link
            to="/men"
            onClick={closeMenu}
          >
            MEN
          </Link>

          <Link
            to="/women"
            onClick={closeMenu}
          >
            WOMEN
          </Link>

          <Link
            to="/kids"
            onClick={closeMenu}
          >
            KIDS
          </Link>

          <Link
            to="/new-arrivals"
            onClick={closeMenu}
          >
            NEW ARRIVALS
          </Link>

          <Link
            to="/sale"
            className="sale-link"
            onClick={closeMenu}
          >
            SALE
          </Link>

          <div className="mobile-menu-divider" />

          {/* ACCOUNT */}

          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                onClick={closeMenu}
              >
                MY ACCOUNT
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="mobile-logout"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
            >
              LOGIN
            </Link>
          )}

          <Link
            to="/wishlist"
            onClick={closeMenu}
          >
            WISHLIST
            {wishlistCount > 0 &&
              ` (${wishlistCount})`}
          </Link>

          <Link
            to="/cart"
            onClick={closeMenu}
          >
            CART
            {cartCount > 0 &&
              ` (${cartCount})`}
          </Link>

        </div>
      )}

      {/* =======================================
          SEARCH OVERLAY
      ======================================= */}

      {searchOpen && (
        <div className="search-overlay">

          {/* BACKDROP */}

          <div
            className="search-backdrop"
            onClick={closeSearch}
          />

          {/* SEARCH PANEL */}

          <div className="search-panel">

            {/* HEADER */}

            <div className="search-panel-header">

              <div className="search-title">

                <Search size={20} />

                <span>
                  SEARCH
                </span>

              </div>

              <button
                className="search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X size={25} />
              </button>

            </div>

            {/* SEARCH INPUT */}

            <div className="search-input-wrapper">

              <Search size={21} />

              <input
                autoFocus
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
              />

              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() =>
                    setSearchQuery("")
                  }
                >
                  <X size={17} />
                </button>
              )}

            </div>

            {/* EMPTY SEARCH */}

            {searchQuery.trim() === "" && (
              <div className="search-placeholder">

                <Search size={32} />

                <p>
                  Search our collection
                </p>

                <span>
                  Try searching for shirts,
                  dresses, jeans, jackets...
                </span>

              </div>
            )}

            {/* SEARCH RESULTS */}

            {searchQuery.trim() !== "" &&
              filteredProducts.length > 0 && (

                <div className="search-results">

                  <div className="search-results-header">

                    <span>
                      SEARCH RESULTS
                    </span>

                    <span>
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1
                        ? "ITEM"
                        : "ITEMS"}
                    </span>

                  </div>

                  <div className="search-results-grid">

                    {filteredProducts
                      .slice(0, 8)
                      .map((product) => (

                        <button
                          key={product.id}
                          className="search-product"
                          onClick={() =>
                            openProduct(
                              product.id
                            )
                          }
                        >

                          <div className="search-product-image">

                            <img
                              src={product.image}
                              alt={product.name}
                            />

                          </div>

                          <div className="search-product-info">

                            <span>
                              {product.category}
                            </span>

                            <h3>
                              {product.name}
                            </h3>

                            <strong>
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                          </div>

                          <ArrowRight
                            size={17}
                          />

                        </button>

                      ))}

                  </div>

                </div>
              )}

            {/* NO RESULTS */}

            {searchQuery.trim() !== "" &&
              filteredProducts.length === 0 && (

                <div className="search-no-results">

                  <Search size={32} />

                  <h3>
                    No products found
                  </h3>

                  <p>
                    We couldn't find anything
                    matching "{searchQuery}".
                  </p>

                </div>
              )}

          </div>

        </div>
      )}
    </>
  );
}

export default Navbar;