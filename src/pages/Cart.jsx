import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

// =========================================================
// WHATSAPP NUMBER
// =========================================================

const WHATSAPP_NUMBER = "916393142558";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  /* =========================================
     EMPTY CART
  ========================================= */

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">

        <div className="empty-cart">

          <ShoppingBag
            size={55}
            strokeWidth={1.2}
          />

          <h1>
            Your Bag Is Empty
          </h1>

          <p>
            Looks like you haven't added
            anything to your bag yet.
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

  /* =========================================
     CALCULATE TOTALS
  ========================================= */

  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );

  const shipping =
    subtotal >= 999
      ? 0
      : 99;

  const total =
    subtotal + shipping;

  /* =========================================
     WHATSAPP ORDER
  ========================================= */

  const handleWhatsAppOrder = () => {

    /* -----------------------------------------
       CREATE CART ITEM MESSAGE
    ----------------------------------------- */

    const itemsMessage = cartItems
      .map((item, index) => {

        const itemPrice =
          Number(item.price || 0);

        const itemQuantity =
          Number(item.quantity || 1);

        const itemTotal =
          itemPrice * itemQuantity;

        return `${index + 1}. ${item.name}
   Category: ${item.category || "—"}
   Size: ${item.selectedSize || "—"}
   Color: ${item.selectedColor || "—"}
   Quantity: ${itemQuantity}
   Price: ₹${itemPrice.toLocaleString("en-IN")}
   Item Total: ₹${itemTotal.toLocaleString("en-IN")}`;

      })
      .join("\n\n");

    /* -----------------------------------------
       SHIPPING
    ----------------------------------------- */

    const shippingMessage =
      shipping === 0
        ? "FREE"
        : `₹${shipping.toLocaleString("en-IN")}`;

    /* -----------------------------------------
       COMPLETE WHATSAPP MESSAGE
    ----------------------------------------- */

    const message = `Hello FashionStore! 👋

I would like to order the following items:

${itemsMessage}

----------------------------
ORDER SUMMARY
----------------------------

Subtotal: ₹${subtotal.toLocaleString("en-IN")}
Shipping: ${shippingMessage}
TOTAL: ₹${total.toLocaleString("en-IN")}

Please confirm my order and let me know the next steps.

Thank you! 🙏`;

    /* -----------------------------------------
       WHATSAPP URL
    ----------------------------------------- */

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;

    /* -----------------------------------------
       OPEN WHATSAPP
    ----------------------------------------- */

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================
     CART
  ========================================= */

  return (
    <main className="cart-page">

      <div className="cart-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="cart-header">

          <div>

            <p className="cart-eyebrow">
              YOUR SELECTION
            </p>

            <h1>
              Shopping Bag
            </h1>

          </div>

          <span>
            {cartItems.length}{" "}
            {cartItems.length === 1
              ? "ITEM"
              : "ITEMS"}
          </span>

        </div>

        {/* =====================================
            CART CONTENT
        ===================================== */}

        <div className="cart-layout">

          {/* ===================================
              CART ITEMS
          =================================== */}

          <div className="cart-items">

            {cartItems.map((item) => (

              <article
                className="cart-item"
                key={`
                  ${item.id}-
                  ${item.selectedSize || "default"}-
                  ${item.selectedColor || "default"}
                `}
              >

                {/* =================================
                    PRODUCT IMAGE
                ================================= */}

                <div className="cart-item-image">

                  <Link
                    to={`/product/${item.id}`}
                  >

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                  </Link>

                </div>

                {/* =================================
                    PRODUCT INFORMATION
                ================================= */}

                <div className="cart-item-info">

                  {/* CATEGORY */}

                  <p className="product-category">
                    {item.category}
                  </p>

                  {/* PRODUCT NAME */}

                  <h2>

                    <Link
                      to={`/product/${item.id}`}
                    >
                      {item.name}
                    </Link>

                  </h2>

                  {/* =================================
                      SELECTED OPTIONS
                  ================================= */}

                  <div className="cart-item-options">

                    {/* SIZE */}

                    {item.selectedSize && (
                      <p className="cart-size">

                        <span>
                          Size:
                        </span>{" "}

                        <strong>
                          {item.selectedSize}
                        </strong>

                      </p>
                    )}

                    {/* COLOR */}

                    {item.selectedColor && (
                      <p className="cart-color">

                        <span>
                          Color:
                        </span>{" "}

                        <strong>
                          {item.selectedColor}
                        </strong>

                      </p>
                    )}

                  </div>

                  {/* =================================
                      PRICE
                  ================================= */}

                  <div className="cart-item-price">

                    ₹
                    {Number(
                      item.price || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </div>

                  {/* =================================
                      ACTIONS
                  ================================= */}

                  <div className="cart-item-actions">

                    {/* QUANTITY */}

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.id,
                            item.selectedSize,
                            item.selectedColor
                          )
                        }
                        aria-label="Decrease quantity"
                      >

                        <Minus
                          size={14}
                        />

                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.id,
                            item.selectedSize,
                            item.selectedColor
                          )
                        }
                        aria-label="Increase quantity"
                      >

                        <Plus
                          size={14}
                        />

                      </button>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                    >

                      <Trash2
                        size={14}
                      />

                      REMOVE

                    </button>

                  </div>

                </div>

                {/* =================================
                    ITEM TOTAL
                ================================= */}

                <div className="cart-item-total">

                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toLocaleString(
                    "en-IN"
                  )}

                </div>

              </article>

            ))}

          </div>

          {/* ===================================
              ORDER SUMMARY
          =================================== */}

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            {/* SUBTOTAL */}

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* SHIPPING */}

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>
                {shipping === 0
                  ? "FREE"
                  : `₹${shipping}`}
              </span>

            </div>

            {/* SHIPPING MESSAGE */}

            {shipping > 0 && (
              <p className="shipping-note">
                Free shipping on orders
                above ₹999
              </p>
            )}

            {/* TOTAL */}

            <div className="summary-total">

              <span>
                TOTAL
              </span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="checkout-btn"
            >
              PROCEED TO CHECKOUT
            </Link>

            {/* =================================
                WHATSAPP ORDER
            ================================= */}

            <button
              type="button"
              className="cart-whatsapp-btn"
              onClick={
                handleWhatsAppOrder
              }
            >

              <MessageCircle
                size={18}
              />

              ORDER ENTIRE CART ON WHATSAPP

            </button>

            {/* CONTINUE SHOPPING */}

            <Link
              to="/"
              className="continue-shopping-link"
            >

              <ArrowLeft
                size={15}
              />

              CONTINUE SHOPPING

            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;