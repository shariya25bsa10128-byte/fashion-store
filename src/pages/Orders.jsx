
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Package,
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle,
  RefreshCw,
  Truck,
  XCircle,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import "./Orders.css";

// =========================================================
// API
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

// =========================================================
// STATUS CONFIG
// =========================================================

const STATUS_STEPS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// =========================================================
// ORDERS
// =========================================================

function Orders() {
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

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =======================================================
  // LOAD ORDERS
  // =======================================================

  useEffect(() => {
    // -----------------------------------------------------
    // WAIT FOR AUTH
    // -----------------------------------------------------

    if (authLoading) {
      return;
    }

    // -----------------------------------------------------
    // USER NOT LOGGED IN
    // -----------------------------------------------------

    if (!isLoggedIn || !user?.id) {
      setOrders([]);

      setError(
        "Please log in to view your orders."
      );

      setLoading(false);

      return;
    }

    let cancelled = false;

    // -----------------------------------------------------
    // FETCH ORDERS
    // -----------------------------------------------------

    const loadOrders = async () => {
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

        const response =
          await fetch(
            `${API_URL}/api/orders?userId=${userId}`
          );

        // ---------------------------------------------------
        // READ RESPONSE SAFELY
        // ---------------------------------------------------

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
          "ORDERS RESPONSE:",
          data
        );

        // ---------------------------------------------------
        // BACKEND ERROR
        // ---------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load orders."
          );
        }

        if (cancelled) {
          return;
        }

        // ---------------------------------------------------
        // ORDERS
        // ---------------------------------------------------

        const receivedOrders =
          Array.isArray(data?.orders)
            ? data.orders
            : [];

        setOrders(
          receivedOrders
        );

      } catch (error) {
        console.error(
          "LOAD ORDERS ERROR:",
          error
        );

        if (cancelled) {
          return;
        }

        setOrders([]);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load orders."
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isLoggedIn,
    user?.id,
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
        month: "short",
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
  // STATUS CLASS
  // =======================================================

  const getStatusClass = (
    status
  ) => {
    return (
      status
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, "-") ||
      "placed"
    );
  };

  // =======================================================
  // STATUS LABEL
  // =======================================================

  const getStatusLabel = (
    status
  ) => {
    if (!status) {
      return "PLACED";
    }

    return status
      .toString()
      .replace(/_/g, " ")
      .toUpperCase();
  };

  // =======================================================
  // STATUS INDEX
  // =======================================================

  const getStatusIndex = (
    status
  ) => {
    const normalized =
      status?.toString().toUpperCase();

    return STATUS_STEPS.indexOf(
      normalized
    );
  };

  // =======================================================
  // GET STATUS ICON
  // =======================================================

  const getStatusIcon = (
    status
  ) => {
    switch (
      status?.toString().toUpperCase()
    ) {
      case "SHIPPED":
        return <Truck size={16} />;

      case "OUT_FOR_DELIVERY":
        return <Truck size={16} />;

      case "DELIVERED":
        return (
          <CheckCircle size={16} />
        );

      case "CANCELLED":
        return <XCircle size={16} />;

      default:
        return <Package size={16} />;
    }
  };

  // =======================================================
  // AUTH LOADING
  // =======================================================

  if (authLoading) {
    return (
      <main className="orders-page">

        <section className="orders-empty">

          <div className="orders-empty-icon">
            <RefreshCw
              size={34}
              className="orders-loading-icon"
            />
          </div>

          <p className="orders-eyebrow">
            MY ACCOUNT
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
      <main className="orders-page">

        <section className="orders-empty">

          <div className="orders-empty-icon">
            <Package size={34} />
          </div>

          <p className="orders-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            Sign In Required
          </h1>

          <p>
            Please sign in to view your
            orders and order history.
          </p>

          <Link
            to="/login"
            state={{
              from: "/orders",
            }}
            className="orders-shop-button"
          >
            SIGN IN
          </Link>

          <Link
            to="/"
            className="orders-secondary-button"
          >
            <ArrowLeft size={16} />
            CONTINUE SHOPPING
          </Link>

        </section>

      </main>
    );
  }

  // =======================================================
  // ORDERS LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="orders-page">

        <section className="orders-empty">

          <div className="orders-empty-icon">
            <RefreshCw
              size={34}
              className="orders-loading-icon"
            />
          </div>

          <p className="orders-eyebrow">
            ORDER HISTORY
          </p>

          <h1>
            Loading Orders
          </h1>

          <p>
            Please wait while we load
            your order history.
          </p>

        </section>

      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <main className="orders-page">

        <section className="orders-empty">

          <div className="orders-empty-icon">
            <Package size={34} />
          </div>

          <p className="orders-eyebrow">
            ORDER HISTORY
          </p>

          <h1>
            Unable to Load
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="orders-shop-button"
            onClick={() =>
              window.location.reload()
            }
          >
            TRY AGAIN
          </button>

          <Link
            to="/account"
            className="orders-secondary-button"
          >
            <ArrowLeft size={16} />
            BACK TO ACCOUNT
          </Link>

        </section>

      </main>
    );
  }

  // =======================================================
  // EMPTY ORDERS
  // =======================================================

  if (orders.length === 0) {
    return (
      <main className="orders-page">

        <section className="orders-empty">

          <div className="orders-empty-icon">
            <Package size={34} />
          </div>

          <p className="orders-eyebrow">
            ORDER HISTORY
          </p>

          <h1>
            No Orders Yet
          </h1>

          <p>
            You haven't placed any orders yet.
            Start shopping and your orders
            will appear here.
          </p>

          <Link
            to="/"
            className="orders-shop-button"
          >
            START SHOPPING
          </Link>

          <Link
            to="/account"
            className="orders-secondary-button"
          >
            <ArrowLeft size={16} />
            BACK TO ACCOUNT
          </Link>

        </section>

      </main>
    );
  }

  // =======================================================
  // ORDERS PAGE
  // =======================================================

  return (
    <main className="orders-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="orders-header">

        <div>

          <p className="orders-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            My Orders
          </h1>

          <p>
            Track your purchases and
            view complete order details.
          </p>

        </div>

        <Link
          to="/account"
          className="orders-back-link"
        >
          <ArrowLeft size={16} />
          ACCOUNT
        </Link>

      </section>

      {/* ===================================================
          ORDER COUNT
      =================================================== */}

      <div className="orders-count">

        <span>
          {orders.length === 1
            ? "1 ORDER"
            : `${orders.length} ORDERS`}
        </span>

      </div>

      {/* ===================================================
          ORDER LIST
      =================================================== */}

      <section className="orders-list">

        {orders.map(
          (order) => {

            // ---------------------------------------------
            // ITEMS
            // ---------------------------------------------

            const orderItems =
              Array.isArray(
                order.items
              )
                ? order.items
                : [];

            // ---------------------------------------------
            // TOTAL
            // ---------------------------------------------

            const orderTotal =
              Number(
                order.total || 0
              );

            // ---------------------------------------------
            // STATUS
            // ---------------------------------------------

            const rawStatus =
              order.orderStatus ||
              order.status ||
              "PLACED";

            const normalizedStatus =
              rawStatus
                ?.toString()
                .toUpperCase();

            const statusClass =
              getStatusClass(
                normalizedStatus
              );

            const statusLabel =
              getStatusLabel(
                normalizedStatus
              );

            const statusIndex =
              getStatusIndex(
                normalizedStatus
              );

            // ---------------------------------------------
            // ORDER NUMBER
            // ---------------------------------------------

            const orderNumber =
              order.orderNumber ||
              order.id;

            // ---------------------------------------------
            // TRACKING
            // ---------------------------------------------

            const hasTracking =
              Boolean(
                order.trackingNumber
              );

            // ---------------------------------------------
            // ORDER CARD
            // ---------------------------------------------

            return (
              <article
                className="order-card"
                key={order.id}
              >

                {/* =======================================
                    ORDER HEADER
                ======================================= */}

                <div className="order-card-header">

                  <div>

                    <span className="order-label">
                      ORDER ID
                    </span>

                    <strong>
                      #{orderNumber}
                    </strong>

                  </div>

                  <div className="order-date">

                    <Clock size={15} />

                    <span>
                      {formatOrderDate(
                        order.createdAt
                      )}
                    </span>

                  </div>

                </div>

                {/* =======================================
                    STATUS + TOTAL
                ======================================= */}

                <div className="order-status-row">

                  <div
                    className={`order-status ${statusClass}`}
                  >

                    {getStatusIcon(
                      normalizedStatus
                    )}

                    <span>
                      {statusLabel}
                    </span>

                  </div>

                  <strong className="order-total">

                    ₹
                    {orderTotal.toLocaleString(
                      "en-IN"
                    )}

                  </strong>

                </div>

                {/* =======================================
                    TRACKING PROGRESS
                ======================================= */}

                {normalizedStatus !==
                  "CANCELLED" && (

                  <div className="order-progress">

                    {STATUS_STEPS.map(
                      (
                        step,
                        index
                      ) => {

                        const isCompleted =
                          statusIndex >=
                          index;

                        const isCurrent =
                          statusIndex ===
                          index;

                        return (
                          <div
                            className={
                              isCompleted
                                ? "order-progress-step completed"
                                : "order-progress-step"
                            }
                            key={step}
                          >

                            <div
                              className="order-progress-dot"
                            >

                              {isCompleted ? (
                                <CheckCircle
                                  size={13}
                                />
                              ) : (
                                <span />
                              )}

                            </div>

                            <span
                              className={
                                isCurrent
                                  ? "order-progress-label current"
                                  : "order-progress-label"
                              }
                            >
                              {getStatusLabel(
                                step
                              )}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

                {/* =======================================
                    CANCELLED STATUS
                ======================================= */}

                {normalizedStatus ===
                  "CANCELLED" && (

                  <div className="order-cancelled">

                    <XCircle size={18} />

                    <div>

                      <strong>
                        ORDER CANCELLED
                      </strong>

                      <span>
                        This order has been cancelled.
                      </span>

                    </div>

                  </div>

                )}

                {/* =======================================
                    TRACKING INFORMATION
                ======================================= */}

                {hasTracking && (

                  <div className="order-tracking-info">

                    <div>

                      <span>
                        COURIER
                      </span>

                      <strong>
                        {order.courierName ||
                          "Shipping Partner"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        TRACKING NUMBER
                      </span>

                      <strong>
                        {order.trackingNumber}
                      </strong>

                    </div>

                  </div>

                )}

                {/* =======================================
                    PRODUCTS
                ======================================= */}

                {orderItems.length > 0 && (

                  <div className="order-items">

                    {orderItems
                      .slice(0, 3)
                      .map(
                        (
                          item,
                          index
                        ) => {

                          // -------------------------------
                          // PRODUCT DATA
                          // -------------------------------

                          const productName =
                            item.productName ||
                            item.name ||
                            "Product";

                          const productImage =
                            item.productImage ||
                            item.image ||
                            "";

                          const selectedSize =
                            item.selectedSize ||
                            item.size ||
                            null;

                          const selectedColor =
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

                          return (
                            <div
                              className="order-item"
                              key={
                                item.id ??
                                `${order.id}-${index}`
                              }
                            >

                              {/* IMAGE */}

                              <div className="order-item-image">

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
                                    size={20}
                                  />

                                )}

                              </div>

                              {/* INFORMATION */}

                              <div className="order-item-info">

                                <h3>
                                  {productName}
                                </h3>

                                <div className="order-item-meta">

                                  {selectedSize && (
                                    <span>
                                      Size:{" "}
                                      {
                                        selectedSize
                                      }
                                    </span>
                                  )}

                                  {selectedColor && (
                                    <span>
                                      Color:{" "}
                                      {
                                        selectedColor
                                      }
                                    </span>
                                  )}

                                  <span>
                                    Qty:{" "}
                                    {quantity}
                                  </span>

                                </div>

                              </div>

                              {/* PRICE */}

                              <strong>

                                ₹
                                {itemPrice.toLocaleString(
                                  "en-IN"
                                )}

                              </strong>

                            </div>
                          );
                        }
                      )}

                    {/* MORE ITEMS */}

                    {orderItems.length > 3 && (

                      <div className="order-more-items">

                        +{" "}
                        {orderItems.length - 3}{" "}
                        more{" "}
                        {orderItems.length - 3 ===
                        1
                          ? "item"
                          : "items"}

                      </div>

                    )}

                  </div>

                )}

                {/* =======================================
                    ORDER FOOTER
                ======================================= */}

                <div className="order-card-footer">

                  <div className="order-card-footer-left">

                    <span>
                      ORDERED{" "}
                      {formatOrderDateTime(
                        order.createdAt
                      )}
                    </span>

                  </div>

                  <Link
                    to={`/orders/${orderNumber}`}
                    className="order-view-button"
                  >

                    VIEW ORDER

                    <ChevronRight
                      size={16}
                    />

                  </Link>

                </div>

              </article>
            );
          }
        )}

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <section className="orders-footer">

        <Link
          to="/"
          className="orders-secondary-button"
        >
          <ArrowLeft size={16} />
          CONTINUE SHOPPING
        </Link>

      </section>

    </main>
  );
}

export default Orders;