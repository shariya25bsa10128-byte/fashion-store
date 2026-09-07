import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";

import "./Orders.css";

function OrderSuccess() {
  // =========================================================
  // GET SAVED ORDER
  // =========================================================

  let order = null;

  try {
    const savedOrder = localStorage.getItem("fashionStoreOrder");

    if (savedOrder) {
      order = JSON.parse(savedOrder);
    }
  } catch (error) {
    console.error("Unable to read saved order:", error);
  }

  // =========================================================
  // NO ORDER FOUND
  // =========================================================

  if (!order) {
    return (
      <main className="order-success-page">
        <div className="order-success-container order-not-found">

          <div className="order-success-icon">
            <Package size={42} strokeWidth={1.5} />
          </div>

          <span className="order-success-label">
            ORDER INFORMATION
          </span>

          <h1>Order information not found</h1>

          <p className="order-success-message">
            We couldn't find your recent order.
            Please check your orders page.
          </p>

          <Link
            to="/orders"
            className="order-success-btn"
          >
            <span>VIEW MY ORDERS</span>
            <ArrowRight size={18} />
          </Link>

        </div>
      </main>
    );
  }

  // =========================================================
  // CUSTOMER INFORMATION
  // =========================================================

  const customerName =
    order.customerName ||
    order.customer?.name ||
    [
      order.customer?.firstName,
      order.customer?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Customer";

  const customerEmail =
    order.customerEmail ||
    order.customer?.email ||
    "";

  const customerPhone =
    order.customerPhone ||
    order.customer?.phone ||
    "";

  // =========================================================
  // ORDER INFORMATION
  // =========================================================

  const orderNumber =
    order.orderNumber ||
    (order.id ? `FS${order.id}` : "FASHIONSTORE");

  const orderStatus =
    order.orderStatus ||
    order.status ||
    "PLACED";

  const paymentMethod =
    order.paymentMethod ||
    "COD";

  // =========================================================
  // ORDER ITEMS
  // =========================================================

  const orderItems = Array.isArray(order.items)
    ? order.items
    : [];

  // =========================================================
  // PRICES
  // =========================================================

  const subtotal = Number(order.subtotal) || 0;

  const shipping =
    Number(
      order.shippingFee ??
      order.shipping ??
      0
    ) || 0;

  const total =
    Number(order.total) ||
    subtotal + shipping;

  // =========================================================
  // SHIPPING ADDRESS
  // =========================================================

  const shippingAddress =
    order.shippingAddress1 ||
    order.address?.address ||
    "";

  const shippingAddress2 =
    order.shippingAddress2 ||
    order.address?.apartment ||
    "";

  const shippingCity =
    order.shippingCity ||
    order.address?.city ||
    "";

  const shippingState =
    order.shippingState ||
    order.address?.state ||
    "";

  const shippingPostalCode =
    order.shippingPostalCode ||
    order.address?.pincode ||
    "";

  // =========================================================
  // ORDER DATE
  // =========================================================

  const orderDate =
    order.createdAt ||
    order.date ||
    new Date().toISOString();

  const parsedDate = new Date(orderDate);

  const formattedDate = Number.isNaN(
    parsedDate.getTime()
  )
    ? "Recently"
    : parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

  // =========================================================
  // PRICE FORMATTER
  // =========================================================

  const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="order-success-page">

      <div className="order-success-container">

        {/* =================================================
            SUCCESS HEADER
        ================================================= */}

        <section className="order-success-header">

          <div className="success-check-wrapper">
            <CheckCircle
              size={46}
              strokeWidth={1.5}
            />
          </div>

          <span className="order-success-label">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank You, {customerName}
          </h1>

          <p className="order-success-message">
            Your order has been placed successfully.
            We've received your order and will begin
            processing it shortly.
          </p>

          {/* ORDER META */}

          <div className="order-success-meta">

            <div className="order-meta-box">
              <span>ORDER NUMBER</span>
              <strong>{orderNumber}</strong>
            </div>

            <div className="order-meta-box">
              <span>PLACED ON</span>
              <strong>{formattedDate}</strong>
            </div>

            <div className="order-meta-box">
              <span>STATUS</span>
              <strong className="status-text">
                {String(orderStatus).toUpperCase()}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            MAIN ORDER CARD
        ================================================= */}

        <section className="success-card">

          <div className="success-card-header">

            <div>
              <span className="success-eyebrow">
                ORDER DETAILS
              </span>

              <h2>Your Order</h2>
            </div>

            <span className="success-status">
              {String(orderStatus).toUpperCase()}
            </span>

          </div>

          {/* PRODUCTS */}

          <div className="success-items">

            {orderItems.length > 0 ? (
              orderItems.map((item, index) => {

                const itemPrice =
                  Number(item.price) || 0;

                const quantity =
                  Number(item.quantity) || 1;

                const itemImage =
                  item.productImage ||
                  item.image ||
                  "";

                const itemName =
                  item.productName ||
                  item.name ||
                  "Product";

                const itemTotal =
                  itemPrice * quantity;

                return (
                  <div
                    className="success-item"
                    key={
                      item.id ||
                      item.productId ||
                      `order-item-${index}`
                    }
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="success-item-image">

                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                        />
                      ) : (
                        <div className="success-item-placeholder">
                          <Package
                            size={25}
                            strokeWidth={1.4}
                          />
                        </div>
                      )}

                      <span className="success-item-quantity">
                        {quantity}
                      </span>

                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="success-item-info">

                      <h3>{itemName}</h3>

                      <div className="success-item-options">

                        {item.size && (
                          <span>
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span>
                            Color: {item.color}
                          </span>
                        )}

                        <span>
                          Qty: {quantity}
                        </span>

                      </div>

                    </div>

                    {/* PRICE */}

                    <strong className="success-item-price">
                      {formatPrice(itemTotal)}
                    </strong>

                  </div>
                );
              })
            ) : (
              <div className="success-empty-items">
                <Package size={28} />
                <p>
                  Order items are not available.
                </p>
              </div>
            )}

          </div>

          {/* TOTALS */}

          <div className="success-totals">

            <div className="success-total-row">
              <span>Subtotal</span>
              <strong>
                {formatPrice(subtotal)}
              </strong>
            </div>

            <div className="success-total-row">
              <span>Shipping</span>

              <strong>
                {shipping === 0
                  ? "FREE"
                  : formatPrice(shipping)}
              </strong>
            </div>

            <div className="success-total-row success-total">

              <span>TOTAL</span>

              <strong>
                {formatPrice(total)}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            CUSTOMER + DELIVERY
        ================================================= */}

        <section className="success-info-grid">

          {/* CUSTOMER */}

          <div className="success-info-card">

            <div className="info-card-icon">
              <CreditCard size={20} />
            </div>

            <div className="info-card-content">

              <span className="success-eyebrow">
                CUSTOMER
              </span>

              <h3>Contact Information</h3>

              <div className="success-info-content">

                <p>{customerName}</p>

                {customerEmail && (
                  <p>{customerEmail}</p>
                )}

                {customerPhone && (
                  <p>{customerPhone}</p>
                )}

              </div>

            </div>

          </div>

          {/* DELIVERY */}

          <div className="success-info-card">

            <div className="info-card-icon">
              <MapPin size={20} />
            </div>

            <div className="info-card-content">

              <span className="success-eyebrow">
                DELIVERY
              </span>

              <h3>Shipping Address</h3>

              <div className="success-info-content">

                {shippingAddress && (
                  <p>{shippingAddress}</p>
                )}

                {shippingAddress2 && (
                  <p>{shippingAddress2}</p>
                )}

                {(shippingCity || shippingState) && (
                  <p>
                    {shippingCity}
                    {shippingCity && shippingState
                      ? ", "
                      : ""}
                    {shippingState}
                  </p>
                )}

                {shippingPostalCode && (
                  <p>{shippingPostalCode}</p>
                )}

                <p>India</p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            PAYMENT / DELIVERY STATUS
        ================================================= */}

        <section className="success-payment">

          <div className="payment-item">

            <div className="payment-icon">
              <CreditCard size={19} />
            </div>

            <div>
              <span>PAYMENT METHOD</span>
              <strong>
                {String(paymentMethod).toUpperCase()}
              </strong>
            </div>

          </div>

          <div className="payment-item">

            <div className="payment-icon">
              <Truck size={19} />
            </div>

            <div>
              <span>ORDER STATUS</span>
              <strong>
                {String(orderStatus).toUpperCase()}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="order-success-actions">

          <Link
            to="/orders"
            className="order-success-btn"
          >
            <span>VIEW MY ORDERS</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/"
            className="order-success-secondary-btn"
          >
            CONTINUE SHOPPING
          </Link>

        </div>

        <p className="success-footer-note">
          Thank you for shopping with FASHIONSTORE.
        </p>

      </div>

    </main>
  );
}

export default OrderSuccess;