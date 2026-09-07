import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Package,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  RefreshCw,
  CheckCircle2,
  Circle,
  XCircle,
  Clock3,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import "./OrderDetails.css";

// =========================================================
// API
// =========================================================

const API_URL = "http://localhost:5000";

// =========================================================
// ORDER STATUS STEPS
// =========================================================

const ORDER_STATUS_STEPS = [
  {
    key: "PLACED",
    label: "ORDER PLACED",
    description:
      "Your order has been received successfully.",
  },
  {
    key: "CONFIRMED",
    label: "ORDER CONFIRMED",
    description:
      "Your order has been confirmed by FashionStore.",
  },
  {
    key: "PROCESSING",
    label: "PROCESSING",
    description:
      "Your order is being prepared for shipment.",
  },
  {
    key: "SHIPPED",
    label: "SHIPPED",
    description:
      "Your order has been handed over to the courier.",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "OUT FOR DELIVERY",
    description:
      "Your order is on the way to your address.",
  },
  {
    key: "DELIVERED",
    label: "DELIVERED",
    description:
      "Your order has been delivered successfully.",
  },
];

// =========================================================
// ORDER DETAILS
// =========================================================

function OrderDetails() {
  // =======================================================
  // URL PARAM
  // =======================================================

  const { orderId } = useParams();

  // =======================================================
  // AUTH CONTEXT
  // =======================================================

  const {
    user,
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  // =======================================================
  // STATE
  // =======================================================

  const [order, setOrder] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =======================================================
  // LOAD ORDER
  // =======================================================

  useEffect(() => {
    // -----------------------------------------------------
    // WAIT FOR AUTH
    // -----------------------------------------------------

    if (authLoading) {
      return;
    }

    // -----------------------------------------------------
    // NOT LOGGED IN
    // -----------------------------------------------------

    if (!isLoggedIn || !user?.id) {
      setOrder(null);

      setError(
        "Please log in to view this order."
      );

      setLoading(false);

      return;
    }

    // -----------------------------------------------------
    // ORDER ID MISSING
    // -----------------------------------------------------

    if (!orderId) {
      setOrder(null);

      setError(
        "Order number is missing."
      );

      setLoading(false);

      return;
    }

    let cancelled = false;

    // -----------------------------------------------------
    // FETCH ORDER
    // -----------------------------------------------------

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const userId =
          Number(user.id);

        if (
          !userId ||
          Number.isNaN(userId)
        ) {
          throw new Error(
            "Unable to identify your account."
          );
        }

        // -------------------------------------------------
        // FETCH USER ORDERS
        // -------------------------------------------------

        const response =
          await fetch(
            `${API_URL}/api/orders?userId=${userId}`
          );

        // -------------------------------------------------
        // READ RESPONSE SAFELY
        // -------------------------------------------------

        const text =
          await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        console.log(
          "ORDER DETAILS RESPONSE:",
          data
        );

        // -------------------------------------------------
        // BACKEND ERROR
        // -------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load order."
          );
        }

        // -------------------------------------------------
        // USER ORDERS
        // -------------------------------------------------

        const userOrders =
          Array.isArray(data?.orders)
            ? data.orders
            : [];

        // -------------------------------------------------
        // FIND ORDER
        // -------------------------------------------------

        const foundOrder =
          userOrders.find(
            (item) =>
              String(
                item.orderNumber
              ) ===
                String(orderId) ||
              String(item.id) ===
                String(orderId)
          );

        // -------------------------------------------------
        // ORDER NOT FOUND
        // -------------------------------------------------

        if (!foundOrder) {
          throw new Error(
            "Order not found."
          );
        }

        if (!cancelled) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error(
          "LOAD ORDER DETAILS ERROR:",
          error
        );

        if (!cancelled) {
          setOrder(null);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load order."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isLoggedIn,
    user?.id,
    orderId,
  ]);

  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatOrderDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =======================================================
  // FORMAT DATE + TIME
  // =======================================================

  const formatOrderDateTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =======================================================
  // NORMALIZE STATUS
  // =======================================================

  const normalizeStatus = (
    status
  ) => {
    if (!status) {
      return "PLACED";
    }

    return String(status)
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "_");
  };

  // =======================================================
  // STATUS LABEL
  // =======================================================

  const getStatusLabel = (
    status
  ) => {
    return String(status || "PLACED")
      .replace(/_/g, " ")
      .toUpperCase();
  };

  // =======================================================
  // STATUS INDEX
  // =======================================================

  const getStatusIndex = (
    status
  ) => {
    return ORDER_STATUS_STEPS.findIndex(
      (step) =>
        step.key === status
    );
  };

  // =======================================================
  // AUTH LOADING
  // =======================================================

  if (authLoading) {
    return (
      <main className="order-details-page">
        <section className="order-details-state">

          <div className="order-details-state-icon">
            <RefreshCw
              size={32}
              className="order-details-loading-icon"
            />
          </div>

          <p className="order-details-eyebrow">
            ORDER DETAILS
          </p>

          <h1>
            Checking Account
          </h1>

          <p>
            Please wait while we check
            your account.
          </p>

        </section>
      </main>
    );
  }

  // =======================================================
  // NOT LOGGED IN
  // =======================================================

  if (
    !isLoggedIn ||
    !user?.id
  ) {
    return (
      <main className="order-details-page">

        <section className="order-details-state">

          <div className="order-details-state-icon">
            <Package size={32} />
          </div>

          <p className="order-details-eyebrow">
            ORDER DETAILS
          </p>

          <h1>
            Sign In Required
          </h1>

          <p>
            Please sign in to view
            your order details.
          </p>

          <Link
            to="/login"
            state={{
              from: `/orders/${orderId}`,
            }}
            className="order-details-button"
          >
            SIGN IN
          </Link>

          <Link
            to="/orders"
            className="order-details-secondary-button"
          >
            <ArrowLeft size={16} />
            BACK TO ORDERS
          </Link>

        </section>

      </main>
    );
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="order-details-page">

        <section className="order-details-state">

          <div className="order-details-state-icon">
            <RefreshCw
              size={32}
              className="order-details-loading-icon"
            />
          </div>

          <p className="order-details-eyebrow">
            ORDER DETAILS
          </p>

          <h1>
            Loading Order
          </h1>

          <p>
            Please wait while we load
            your order details.
          </p>

        </section>

      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (
    error ||
    !order
  ) {
    return (
      <main className="order-details-page">

        <section className="order-details-state">

          <div className="order-details-state-icon">
            <Package size={32} />
          </div>

          <p className="order-details-eyebrow">
            ORDER DETAILS
          </p>

          <h1>
            Order Not Found
          </h1>

          <p>
            {error ||
              "We couldn't find this order."}
          </p>

          <Link
            to="/orders"
            className="order-details-button"
          >
            <ArrowLeft size={16} />
            BACK TO ORDERS
          </Link>

        </section>

      </main>
    );
  }

  // =======================================================
  // ORDER DATA
  // =======================================================

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const subtotal =
    Number(
      order.subtotal || 0
    );

  const shippingFee =
    Number(
      order.shippingFee || 0
    );

  const discount =
    Number(
      order.discount || 0
    );

  const total =
    Number(
      order.total || 0
    );

  const rawStatus =
    order.orderStatus ||
    order.status ||
    "PLACED";

  const normalizedStatus =
    normalizeStatus(
      rawStatus
    );

  const currentStatusIndex =
    getStatusIndex(
      normalizedStatus
    );

  const paymentMethod =
    order.paymentMethod ||
    "N/A";

  const paymentStatus =
    order.paymentStatus ||
    "N/A";

  const orderNumber =
    order.orderNumber ||
    order.id;

  const isCancelled =
    normalizedStatus ===
    "CANCELLED";

  const isDelivered =
    normalizedStatus ===
    "DELIVERED";

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main className="order-details-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="order-details-header">

        <div>

          <p className="order-details-eyebrow">
            ORDER DETAILS
          </p>

          <h1>
            #{orderNumber}
          </h1>

          <p>
            Placed on{" "}
            {formatOrderDate(
              order.createdAt
            )}
          </p>

        </div>

        <Link
          to="/orders"
          className="order-details-back"
        >
          <ArrowLeft size={16} />
          BACK TO ORDERS
        </Link>

      </section>

      {/* ===================================================
          CURRENT STATUS CARD
      =================================================== */}

      <section
        className={`order-details-status-card ${
          isCancelled
            ? "cancelled"
            : isDelivered
              ? "delivered"
              : ""
        }`}
      >

        <div className="order-status-icon">

          {isCancelled ? (
            <XCircle size={22} />
          ) : isDelivered ? (
            <CheckCircle2 size={22} />
          ) : (
            <Truck size={22} />
          )}

        </div>

        <div className="order-current-status">

          <span>
            CURRENT ORDER STATUS
          </span>

          <strong>
            {getStatusLabel(
              normalizedStatus
            )}
          </strong>

          {order.updatedAt && (
            <small>
              Last updated{" "}
              {formatOrderDateTime(
                order.updatedAt
              )}
            </small>
          )}

        </div>

        {/* =================================================
            TRACKING
        ================================================= */}

        {order.trackingNumber && (
          <div className="order-tracking">

            <div>

              <span>
                TRACKING NUMBER
              </span>

              <strong>
                {order.trackingNumber}
              </strong>

            </div>

            {order.courierName && (
              <div>

                <span>
                  COURIER
                </span>

                <strong>
                  {order.courierName}
                </strong>

              </div>
            )}

          </div>
        )}

      </section>

      {/* ===================================================
          CANCELLED MESSAGE
      =================================================== */}

      {isCancelled && (
        <section className="order-cancelled-banner">

          <XCircle size={20} />

          <div>

            <strong>
              THIS ORDER HAS BEEN CANCELLED
            </strong>

            <span>
              If you believe this was cancelled
              incorrectly, please contact
              FashionStore support.
            </span>

          </div>

        </section>
      )}

      {/* ===================================================
          ORDER TRACKING TIMELINE
      =================================================== */}

      {!isCancelled && (
        <section className="order-tracking-timeline">

          <div className="order-details-card-title">

            <Truck size={18} />

            <div>

              <h2>
                Track Your Order
              </h2>

              <p>
                Follow your order from
                placement to delivery.
              </p>

            </div>

          </div>

          <div className="tracking-steps">

            {ORDER_STATUS_STEPS.map(
              (
                step,
                index
              ) => {

                const isCompleted =
                  currentStatusIndex >=
                  index;

                const isCurrent =
                  currentStatusIndex ===
                  index;

                const isPending =
                  currentStatusIndex <
                  index;

                return (
                  <div
                    className={`tracking-step ${
                      isCompleted
                        ? "completed"
                        : ""
                    } ${
                      isCurrent
                        ? "current"
                        : ""
                    } ${
                      isPending
                        ? "pending"
                        : ""
                    }`}
                    key={
                      step.key
                    }
                  >

                    {/* CONNECTING LINE */}

                    {index <
                      ORDER_STATUS_STEPS.length -
                        1 && (
                      <div
                        className={`tracking-line ${
                          currentStatusIndex >
                          index
                            ? "filled"
                            : ""
                        }`}
                      />
                    )}

                    {/* INDICATOR */}

                    <div className="tracking-step-indicator">

                      {isCompleted ? (
                        <CheckCircle2
                          size={18}
                        />
                      ) : (
                        <Circle
                          size={18}
                        />
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="tracking-step-content">

                      <strong>
                        {step.label}
                      </strong>

                      <span>
                        {isCurrent
                          ? "Current status"
                          : isCompleted
                            ? "Completed"
                            : step.description}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <section className="order-details-grid">

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>

          {/* ===============================================
              ORDERED PRODUCTS
          =============================================== */}

          <section className="order-details-card">

            <div className="order-details-card-title">

              <ShoppingBag size={18} />

              <div>

                <h2>
                  Ordered Items
                </h2>

                <p>
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}{" "}
                  in this order
                </p>

              </div>

            </div>

            <div className="order-details-items">

              {items.length === 0 ? (

                <div className="order-no-items">

                  <ShoppingBag
                    size={22}
                  />

                  <p>
                    No items found for
                    this order.
                  </p>

                </div>

              ) : (

                items.map(
                  (
                    item,
                    index
                  ) => {

                    const productName =
                      item.productName ||
                      item.name ||
                      "Product";

                    const productImage =
                      item.productImage ||
                      item.image ||
                      "";

                    const size =
                      item.selectedSize ||
                      item.size ||
                      null;

                    const color =
                      item.selectedColor ||
                      item.color ||
                      null;

                    const quantity =
                      Number(
                        item.quantity
                      ) || 1;

                    const itemPrice =
                      Number(
                        item.price
                      ) || 0;

                    const itemTotal =
                      itemPrice *
                      quantity;

                    return (
                      <div
                        className="order-details-item"
                        key={
                          item.id ??
                          `${order.id}-${index}`
                        }
                      >

                        {/* IMAGE */}

                        <div className="order-details-item-image">

                          {productImage ? (

                            <img
                              src={
                                productImage
                              }
                              alt={
                                productName
                              }
                            />

                          ) : (

                            <ShoppingBag
                              size={24}
                            />

                          )}

                        </div>

                        {/* INFORMATION */}

                        <div className="order-details-item-info">

                          <h3>
                            {productName}
                          </h3>

                          <div className="order-details-item-meta">

                            {size && (
                              <span>
                                Size:{" "}
                                <strong>
                                  {size}
                                </strong>
                              </span>
                            )}

                            {color && (
                              <span>
                                Color:{" "}
                                <strong>
                                  {color}
                                </strong>
                              </span>
                            )}

                            <span>
                              Qty:{" "}
                              <strong>
                                {quantity}
                              </strong>
                            </span>

                          </div>

                        </div>

                        {/* PRICE */}

                        <div className="order-details-item-price">

                          <strong>
                            ₹
                            {itemTotal.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          {quantity >
                            1 && (
                            <span>
                              ₹
                              {itemPrice.toLocaleString(
                                "en-IN"
                              )}{" "}
                              each
                            </span>
                          )}

                        </div>

                      </div>
                    );
                  }
                )

              )}

            </div>

          </section>

          {/* ===============================================
              SHIPPING ADDRESS
          =============================================== */}

          <section className="order-details-card">

            <div className="order-details-card-title">

              <MapPin size={18} />

              <div>

                <h2>
                  Shipping Address
                </h2>

                <p>
                  Delivery destination
                </p>

              </div>

            </div>

            <div className="order-address">

              {order.customerName && (
                <strong>
                  {order.customerName}
                </strong>
              )}

              {order.shippingAddress1 && (
                <span>
                  {order.shippingAddress1}
                </span>
              )}

              {order.shippingAddress2 && (
                <span>
                  {order.shippingAddress2}
                </span>
              )}

              {(order.shippingCity ||
                order.shippingState) && (
                <span>
                  {order.shippingCity}

                  {order.shippingState
                    ? `, ${order.shippingState}`
                    : ""}
                </span>
              )}

              {order.shippingPostalCode && (
                <span>
                  {order.shippingPostalCode}
                </span>
              )}

              {order.shippingCountry && (
                <span>
                  {order.shippingCountry}
                </span>
              )}

              {order.customerPhone && (
                <span className="order-address-phone">
                  Phone:{" "}
                  {order.customerPhone}
                </span>
              )}

            </div>

          </section>

        </div>

        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div>

          {/* ===============================================
              ORDER SUMMARY
          =============================================== */}

          <section className="order-details-card">

            <div className="order-details-card-title">

              <Package size={18} />

              <div>

                <h2>
                  Order Summary
                </h2>

                <p>
                  Payment breakdown
                </p>

              </div>

            </div>

            <div className="order-summary">

              {/* SUBTOTAL */}

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              {/* DISCOUNT */}

              {discount > 0 && (
                <div className="order-discount-row">

                  <span>
                    Discount
                  </span>

                  <strong>
                    - ₹
                    {discount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>
              )}

              {/* SHIPPING */}

              <div>

                <span>
                  Shipping
                </span>

                <strong>
                  {shippingFee === 0
                    ? "FREE"
                    : `₹${shippingFee.toLocaleString(
                        "en-IN"
                      )}`}
                </strong>

              </div>

              {/* TOTAL */}

              <div className="order-summary-total">

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

            </div>

          </section>

          {/* ===============================================
              PAYMENT
          =============================================== */}

          <section className="order-details-card">

            <div className="order-details-card-title">

              <CreditCard size={18} />

              <div>

                <h2>
                  Payment
                </h2>

                <p>
                  Payment information
                </p>

              </div>

            </div>

            <div className="order-payment">

              {/* PAYMENT METHOD */}

              <div>

                <span>
                  PAYMENT METHOD
                </span>

                <strong>

                  {String(
                    paymentMethod
                  ).toLowerCase() ===
                  "cod"
                    ? "Cash on Delivery"
                    : String(
                        paymentMethod
                      ).toUpperCase()}

                </strong>

              </div>

              {/* PAYMENT STATUS */}

              <div>

                <span>
                  PAYMENT STATUS
                </span>

                <strong>
                  {String(
                    paymentStatus
                  ).toUpperCase()}
                </strong>

              </div>

            </div>

          </section>

          {/* ===============================================
              DELIVERY INFORMATION
          =============================================== */}

          <section className="order-details-card">

            <div className="order-details-card-title">

              <Clock3 size={18} />

              <div>

                <h2>
                  Order Information
                </h2>

                <p>
                  Important order details
                </p>

              </div>

            </div>

            <div className="order-information">

              <div>

                <span>
                  ORDER NUMBER
                </span>

                <strong>
                  #{orderNumber}
                </strong>

              </div>

              <div>

                <span>
                  ORDER DATE
                </span>

                <strong>
                  {formatOrderDate(
                    order.createdAt
                  )}
                </strong>

              </div>

              {order.couponCode && (
                <div>

                  <span>
                    COUPON
                  </span>

                  <strong>
                    {order.couponCode}
                  </strong>

                </div>
              )}

              {order.trackingNumber && (
                <div>

                  <span>
                    TRACKING
                  </span>

                  <strong>
                    {order.trackingNumber}
                  </strong>

                </div>
              )}

              {order.courierName && (
                <div>

                  <span>
                    COURIER
                  </span>

                  <strong>
                    {order.courierName}
                  </strong>

                </div>
              )}

            </div>

          </section>

        </div>

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <section className="order-details-footer">

        <Link
          to="/orders"
          className="order-details-button"
        >
          <ArrowLeft size={16} />
          BACK TO MY ORDERS
        </Link>

      </section>

    </main>
  );
}

export default OrderDetails;