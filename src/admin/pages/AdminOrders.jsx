import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../admin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ORDER_STATUSES = [
  "ALL",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/orders`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load orders"
        );
      }

      const orderData = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.orders)
        ? result.orders
        : [];

      setOrders(orderData);
    } catch (error) {
      console.error("ADMIN ORDERS ERROR:", error);

      setError(
        error.message ||
          "Unable to load orders. Make sure the backend server is running."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update order status"
        );
      }

      const updatedOrder = result.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                orderStatus: newStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
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
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return status
      .toLowerCase()
      .replaceAll("_", "-");
  };

  // =========================================================
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        order.orderStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const orderNumber = String(
        order.orderNumber || ""
      ).toLowerCase();

      const customerName = String(
        order.customerName || ""
      ).toLowerCase();

      const customerEmail = String(
        order.customerEmail || ""
      ).toLowerCase();

      return (
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue)
      );
    });
  }, [orders, search, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) =>
        order.orderStatus === "PLACED" ||
        order.orderStatus === "CONFIRMED" ||
        order.orderStatus === "PROCESSING"
    ).length;

    const shipped = orders.filter(
      (order) =>
        order.orderStatus === "SHIPPED" ||
        order.orderStatus === "OUT_FOR_DELIVERY"
    ).length;

    const delivered = orders.filter(
      (order) =>
        order.orderStatus === "DELIVERED"
    ).length;

    return {
      total,
      pending,
      shipped,
      delivered,
    };
  }, [orders]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>LOADING ORDERS...</p>
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
            Orders
          </h1>

          <p className="admin-header-description">
            View customer orders and manage
            their delivery status.
          </p>
        </div>

        <div className="admin-header-actions">

          <Link
            to="/admin"
            className="admin-back-button"
          >
            ← DASHBOARD
          </Link>

          <button
            type="button"
            className="admin-primary-button"
            onClick={loadOrders}
          >
            REFRESH
          </button>

        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-message admin-error">
          {error}
        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="admin-stats-grid">

        <div className="admin-stat-card">
          <p>ALL ORDERS</p>

          <h2>
            {statistics.total}
          </h2>

          <span>
            TOTAL ORDERS
          </span>
        </div>


        <div className="admin-stat-card">
          <p>PENDING</p>

          <h2>
            {statistics.pending}
          </h2>

          <span>
            NEED ATTENTION
          </span>
        </div>


        <div className="admin-stat-card">
          <p>SHIPPED</p>

          <h2>
            {statistics.shipped}
          </h2>

          <span>
            IN TRANSIT
          </span>
        </div>


        <div className="admin-stat-card">
          <p>DELIVERED</p>

          <h2>
            {statistics.delivered}
          </h2>

          <span>
            COMPLETED
          </span>
        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-orders-toolbar">

          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by order number, customer or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            {ORDER_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status === "ALL"
                  ? "ALL STATUS"
                  : status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

        </div>

      </section>


      {/* =====================================================
          ORDERS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <p>ORDER MANAGEMENT</p>

            <h2>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "Order"
                : "Orders"}
            </h2>
          </div>

        </div>


        {filteredOrders.length === 0 ? (

          <div className="admin-empty">
            <h3>
              No orders found
            </h3>

            <p>
              Try changing your search or
              status filter.
            </p>
          </div>

        ) : (

          <div className="admin-orders-table-wrapper">

            <table className="admin-orders-table">

              <thead>
                <tr>

                  <th>
                    ORDER
                  </th>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    DATE
                  </th>

                  <th>
                    PAYMENT
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    TOTAL
                  </th>

                </tr>
              </thead>


              <tbody>

                {filteredOrders.map((order) => (

                  <tr key={order.id}>

                    {/* ORDER */}

                    <td>

                      <Link
  to={`/admin/orders/${order.id}`}
  className="admin-order-link"
>
  {order.orderNumber || `#${order.id}`}
</Link>

                      <span className="admin-table-subtext">
                        {order.items?.length || 0}{" "}
{order.items?.length === 1
  ? "item"
  : "items"}
                      </span>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="admin-customer-cell">

                        <strong>
                          {order.customerName ||
                            "Customer"}
                        </strong>

                        <span>
                          {order.customerEmail ||
                            "—"}
                        </span>

                      </div>

                    </td>


                    {/* DATE */}

                    <td>
                      {formatDate(
                        order.createdAt
                      )}
                    </td>


                    {/* PAYMENT */}

                    <td>

                      <span
                        className={`admin-status ${
                          order.paymentStatus
                            ?.toLowerCase() || ""
                        }`}
                      >
                        {order.paymentStatus ||
                          "PENDING"}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <select
                        className={`admin-order-status-select ${getStatusClass(
                          order.orderStatus
                        )}`}
                        value={
                          order.orderStatus ||
                          "PLACED"
                        }
                        disabled={
                          updatingOrderId ===
                          order.id
                        }
                        onChange={(event) =>
                          updateOrderStatus(
                            order.id,
                            event.target.value
                          )
                        }
                      >

                        {ORDER_STATUSES
                          .filter(
                            (status) =>
                              status !== "ALL"
                          )
                          .map((status) => (

                            <option
                              key={status}
                              value={status}
                            >
                              {status.replaceAll(
                                "_",
                                " "
                              )}
                            </option>

                          ))}

                      </select>

                    </td>


                    {/* TOTAL */}

                    <td>

                      <strong>
                        {formatCurrency(
                          order.total
                        )}
                      </strong>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminOrders;