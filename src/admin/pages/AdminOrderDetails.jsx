import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../Admin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");

  // =========================================================
  // LOAD ORDER
  // =========================================================

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${id}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load order"
        );
      }

      const orderData = result.data || result.order;

      if (!orderData) {
        throw new Error("Order not found");
      }

      setOrder(orderData);

      setOrderStatus(
        orderData.orderStatus || "PLACED"
      );

      setPaymentStatus(
        orderData.paymentStatus || "PENDING"
      );

      setTrackingNumber(
        orderData.trackingNumber || ""
      );

      setCourierName(
        orderData.courierName || ""
      );
    } catch (error) {
      console.error(
        "ADMIN ORDER DETAILS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load order information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE ORDER
  // =========================================================

  const updateOrder = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
            trackingNumber:
              trackingNumber.trim() || null,
            courierName:
              courierName.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update order"
        );
      }

      const updatedOrder =
        result.data || result.order;

      if (updatedOrder) {
        setOrder((currentOrder) => ({
          ...currentOrder,
          ...updatedOrder,
        }));
      }

      setSuccess(
        "Order updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE ADMIN ORDER ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to update order."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT DATE + TIME
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return String(status)
      .toLowerCase()
      .replaceAll("_", "-");
  };

  // =========================================================
  // GET ORDER ITEMS
  // =========================================================

  const orderItems = Array.isArray(order?.items)
    ? order.items
    : [];

  // =========================================================
  // CUSTOMER INFORMATION
  // =========================================================

  const customerName =
    order?.customerName ||
    order?.user?.name ||
    order?.user?.username ||
    "Customer";

  const customerEmail =
    order?.customerEmail ||
    order?.user?.email ||
    "—";

  const customerPhone =
    order?.customerPhone ||
    order?.user?.phone ||
    "—";

  // =========================================================
  // PRODUCT INFORMATION HELPERS
  // =========================================================

  const getItemName = (item) => {
    return (
      item?.productName ||
      item?.name ||
      item?.product?.name ||
      "Product"
    );
  };

  const getItemImage = (item) => {
    return (
      item?.productImage ||
      item?.image ||
      item?.product?.image ||
      ""
    );
  };

  const getItemPrice = (item) => {
    return (
      item?.price ??
      item?.unitPrice ??
      item?.product?.price ??
      0
    );
  };

  const getItemQuantity = (item) => {
    return Number(item?.quantity) || 1;
  };

  // =========================================================
  // SHIPPING ADDRESS
  // =========================================================

  const shippingAddress1 =
    order?.shippingAddress1 || "—";

  const shippingAddress2 =
    order?.shippingAddress2 || "";

  const shippingCity =
    order?.shippingCity || "—";

  const shippingState =
    order?.shippingState || "—";

  const shippingPostalCode =
    order?.shippingPostalCode || "—";

  const shippingCountry =
    order?.shippingCountry || "India";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>LOADING ORDER...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR / ORDER NOT FOUND
  // =========================================================

  if (error && !order) {
    return (
      <main className="admin-page">

        <section className="admin-header">

          <div>
            <p className="admin-eyebrow">
              ADMIN PANEL
            </p>

            <h1>
              Order
            </h1>

            <p className="admin-header-description">
              Unable to load order information.
            </p>
          </div>

          <div className="admin-header-actions">

            <Link
              to="/admin/orders"
              className="admin-back-button"
            >
              ← ORDERS
            </Link>

            <button
              type="button"
              className="admin-primary-button"
              onClick={loadOrder}
            >
              RETRY
            </button>

          </div>

        </section>

        <div className="admin-message admin-error">
          {error}
        </div>

      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-header">

        <div>

          <p className="admin-eyebrow">
            ADMIN PANEL
          </p>

          <h1>
            {order?.orderNumber ||
              `Order #${order?.id}`}
          </h1>

          <p className="admin-header-description">
            View and manage complete order
            information.
          </p>

        </div>

        <div className="admin-header-actions">

          <Link
            to="/admin/orders"
            className="admin-back-button"
          >
            ← ORDERS
          </Link>

          <button
            type="button"
            className="admin-primary-button"
            onClick={loadOrder}
            disabled={saving}
          >
            REFRESH
          </button>

        </div>

      </section>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-message admin-success">
          {success}
        </div>
      )}


      {/* =====================================================
          ORDER SUMMARY
      ===================================================== */}

      <section className="admin-stats-grid">

        <div className="admin-stat-card">

          <p>
            ORDER STATUS
          </p>

          <h2>
            {String(
              orderStatus || "PLACED"
            ).replaceAll("_", " ")}
          </h2>

          <span>
            CURRENT STATUS
          </span>

        </div>


        <div className="admin-stat-card">

          <p>
            PAYMENT
          </p>

          <h2>
            {paymentStatus || "PENDING"}
          </h2>

          <span>
            PAYMENT STATUS
          </span>

        </div>


        <div className="admin-stat-card">

          <p>
            ORDER TOTAL
          </p>

          <h2>
            {formatCurrency(order?.total)}
          </h2>

          <span>
            TOTAL AMOUNT
          </span>

        </div>


        <div className="admin-stat-card">

          <p>
            ORDER DATE
          </p>

          <h2>
            {formatDate(order?.createdAt)}
          </h2>

          <span>
            PLACED ON
          </span>

        </div>

      </section>


      {/* =====================================================
          CUSTOMER + SHIPPING + ORDER INFORMATION
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              ORDER INFORMATION
            </p>

            <h2>
              Customer & Order
            </h2>

          </div>

        </div>


        <div className="admin-customer-grid">


          {/* =================================================
              CUSTOMER
          ================================================= */}

          <div className="admin-detail-card">

            <p className="admin-eyebrow">
              CUSTOMER
            </p>

            <h3>
              {customerName}
            </h3>

            <div className="admin-detail-list">

              <div>

                <span>
                  EMAIL
                </span>

                <strong>
                  {customerEmail}
                </strong>

              </div>

              <div>

                <span>
                  PHONE
                </span>

                <strong>
                  {customerPhone}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              SHIPPING ADDRESS
          ================================================= */}

          <div className="admin-detail-card">

            <p className="admin-eyebrow">
              SHIPPING
            </p>

            <h3>
              Delivery Address
            </h3>

            <div className="admin-detail-list">

              <div>

                <span>
                  ADDRESS
                </span>

                <strong>
                  {shippingAddress1}
                </strong>

              </div>


              {shippingAddress2 && (
                <div>

                  <span>
                    ADDRESS LINE 2
                  </span>

                  <strong>
                    {shippingAddress2}
                  </strong>

                </div>
              )}


              <div>

                <span>
                  CITY
                </span>

                <strong>
                  {shippingCity}
                </strong>

              </div>


              <div>

                <span>
                  STATE
                </span>

                <strong>
                  {shippingState}
                </strong>

              </div>


              <div>

                <span>
                  POSTAL CODE
                </span>

                <strong>
                  {shippingPostalCode}
                </strong>

              </div>


              <div>

                <span>
                  COUNTRY
                </span>

                <strong>
                  {shippingCountry}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              ORDER
          ================================================= */}

          <div className="admin-detail-card">

            <p className="admin-eyebrow">
              ORDER
            </p>

            <h3>
              {order?.orderNumber ||
                `#${order?.id}`}
            </h3>

            <div className="admin-detail-list">

              <div>

                <span>
                  ORDER ID
                </span>

                <strong>
                  #{order?.id}
                </strong>

              </div>


              <div>

                <span>
                  CREATED
                </span>

                <strong>
                  {formatDateTime(
                    order?.createdAt
                  )}
                </strong>

              </div>


              {order?.updatedAt && (
                <div>

                  <span>
                    UPDATED
                  </span>

                  <strong>
                    {formatDateTime(
                      order.updatedAt
                    )}
                  </strong>

                </div>
              )}

            </div>

          </div>


        </div>

      </section>


      {/* =====================================================
          ORDER ITEMS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              ORDER CONTENTS
            </p>

            <h2>
              {orderItems.length}{" "}
              {orderItems.length === 1
                ? "Item"
                : "Items"}
            </h2>

          </div>

        </div>


        {orderItems.length === 0 ? (

          <div className="admin-empty">

            <h3>
              No order items found
            </h3>

            <p>
              This order does not contain
              product information.
            </p>

          </div>

        ) : (

          <div className="admin-order-items">

            {orderItems.map((item, index) => {

              const itemName =
                getItemName(item);

              const itemImage =
                getItemImage(item);

              const itemPrice =
                Number(
                  getItemPrice(item)
                ) || 0;

              const quantity =
                getItemQuantity(item);

              const itemTotal =
                itemPrice * quantity;

              return (
                <div
                  className="admin-order-item"
                  key={
                    item.id ||
                    `${item.productId || "item"}-${index}`
                  }
                >

                  {/* IMAGE */}

                  <div className="admin-order-item-image">

                    {itemImage ? (

                      <img
                        src={itemImage}
                        alt={itemName}
                      />

                    ) : (

                      <div>
                        NO IMAGE
                      </div>

                    )}

                  </div>


                  {/* INFORMATION */}

                  <div className="admin-order-item-info">

                    <h3>
                      {itemName}
                    </h3>

                    {item.product?.category && (
                      <span>
                        {item.product.category}
                      </span>
                    )}

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
                      Quantity: {quantity}
                    </span>

                  </div>


                  {/* PRICE */}

                  <div className="admin-order-item-price">

                    <span>
                      {formatCurrency(itemPrice)}
                    </span>

                    <strong>
                      {formatCurrency(itemTotal)}
                    </strong>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>


      {/* =====================================================
          PAYMENT SUMMARY
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              PAYMENT
            </p>

            <h2>
              Order Summary
            </h2>

          </div>

        </div>


        <div className="admin-payment-summary">

          {/* SUBTOTAL */}

          <div>

            <span>
              SUBTOTAL
            </span>

            <strong>
              {formatCurrency(
                order?.subtotal ?? 0
              )}
            </strong>

          </div>


          {/* SHIPPING */}

          <div>

            <span>
              SHIPPING
            </span>

            <strong>
              {formatCurrency(
                order?.shippingFee ?? 0
              )}
            </strong>

          </div>


          {/* DISCOUNT */}

          <div>

            <span>
              DISCOUNT
            </span>

            <strong>
              -{formatCurrency(
                order?.discount ?? 0
              )}
            </strong>

          </div>


          {/* COUPON */}

          {order?.couponCode && (
            <div>

              <span>
                COUPON
              </span>

              <strong>
                {order.couponCode}
              </strong>

            </div>
          )}


          {/* PAYMENT METHOD */}

          <div>

            <span>
              PAYMENT METHOD
            </span>

            <strong>
              {order?.paymentMethod || "—"}
            </strong>

          </div>


          {/* TOTAL */}

          <div className="admin-payment-total">

            <span>
              TOTAL
            </span>

            <strong>
              {formatCurrency(order?.total)}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          UPDATE ORDER
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              ORDER MANAGEMENT
            </p>

            <h2>
              Update Order
            </h2>

          </div>

        </div>


        <div className="admin-form-grid">

          {/* ORDER STATUS */}

          <div className="admin-form-group">

            <label htmlFor="order-status">
              ORDER STATUS
            </label>

            <select
              id="order-status"
              className={`admin-filter-select ${getStatusClass(
                orderStatus
              )}`}
              value={orderStatus}
              onChange={(event) =>
                setOrderStatus(
                  event.target.value
                )
              }
              disabled={saving}
            >

              {ORDER_STATUSES.map(
                (status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status.replaceAll(
                      "_",
                      " "
                    )}
                  </option>

                )
              )}

            </select>

          </div>


          {/* PAYMENT STATUS */}

          <div className="admin-form-group">

            <label htmlFor="payment-status">
              PAYMENT STATUS
            </label>

            <select
              id="payment-status"
              className="admin-filter-select"
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(
                  event.target.value
                )
              }
              disabled={saving}
            >

              {PAYMENT_STATUSES.map(
                (status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>

                )
              )}

            </select>

          </div>


          {/* TRACKING NUMBER */}

          <div className="admin-form-group">

            <label htmlFor="tracking-number">
              TRACKING NUMBER
            </label>

            <input
              id="tracking-number"
              type="text"
              className="admin-search-input"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value
                )
              }
              disabled={saving}
            />

          </div>


          {/* COURIER */}

          <div className="admin-form-group">

            <label htmlFor="courier-name">
              COURIER NAME
            </label>

            <input
              id="courier-name"
              type="text"
              className="admin-search-input"
              placeholder="Enter courier name"
              value={courierName}
              onChange={(event) =>
                setCourierName(
                  event.target.value
                )
              }
              disabled={saving}
            />

          </div>

        </div>


        {/* FORM ACTIONS */}

        <div className="admin-form-actions">

          <button
            type="button"
            className="admin-primary-button"
            onClick={updateOrder}
            disabled={saving}
          >
            {saving
              ? "SAVING..."
              : "SAVE CHANGES"}
          </button>

          <button
            type="button"
            className="admin-back-button"
            onClick={() =>
              navigate("/admin/orders")
            }
            disabled={saving}
          >
            CANCEL
          </button>

        </div>

      </section>

    </main>
  );
}

export default AdminOrderDetails;