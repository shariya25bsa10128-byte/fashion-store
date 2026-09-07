import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../Admin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminCustomerDetails() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD CUSTOMER
  // =========================================================

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/customers/${id}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load customer"
        );
      }

      setCustomer(result.data);
    } catch (error) {
      console.error(
        "ADMIN CUSTOMER DETAILS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load customer. Make sure the backend server is running."
      );

      setCustomer(null);
    } finally {
      setLoading(false);
    }
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>LOADING CUSTOMER...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !customer) {
    return (
      <main className="admin-page">

        <section className="admin-header">

          <div>
            <p className="admin-eyebrow">
              ADMIN PANEL
            </p>

            <h1>
              Customer
            </h1>

            <p className="admin-header-description">
              Unable to load customer information.
            </p>
          </div>

          <div className="admin-header-actions">

            <Link
              to="/admin/customers"
              className="admin-back-button"
            >
              ← CUSTOMERS
            </Link>

            <button
              type="button"
              className="admin-primary-button"
              onClick={loadCustomer}
            >
              RETRY
            </button>

          </div>

        </section>

        <div className="admin-message admin-error">
          {error || "Customer not found."}
        </div>

      </main>
    );
  }

  // =========================================================
  // CUSTOMER DATA
  // =========================================================

  const orders = Array.isArray(customer.orders)
    ? customer.orders
    : [];

  const addresses = Array.isArray(customer.addresses)
    ? customer.addresses
    : [];

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
            {customer.name || "Customer"}
          </h1>

          <p className="admin-header-description">
            View customer information, orders and
            saved addresses.
          </p>

        </div>

        <div className="admin-header-actions">

          <Link
            to="/admin/customers"
            className="admin-back-button"
          >
            ← CUSTOMERS
          </Link>

          <button
            type="button"
            className="admin-primary-button"
            onClick={loadCustomer}
          >
            REFRESH
          </button>

        </div>

      </section>


      {/* =====================================================
          CUSTOMER OVERVIEW
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <p>CUSTOMER INFORMATION</p>

            <h2>
              Account Details
            </h2>
          </div>

        </div>


        <div className="admin-customer-details-grid">

          <div className="admin-detail-card">

            <span className="admin-detail-label">
              NAME
            </span>

            <strong>
              {customer.name || "—"}
            </strong>

          </div>


          <div className="admin-detail-card">

            <span className="admin-detail-label">
              USERNAME
            </span>

            <strong>
              {customer.username || "—"}
            </strong>

          </div>


          <div className="admin-detail-card">

            <span className="admin-detail-label">
              EMAIL
            </span>

            <strong>
              {customer.email || "—"}
            </strong>

          </div>


          <div className="admin-detail-card">

            <span className="admin-detail-label">
              PHONE
            </span>

            <strong>
              {customer.phone || "—"}
            </strong>

          </div>


          <div className="admin-detail-card">

            <span className="admin-detail-label">
              ROLE
            </span>

            <strong>
              {customer.role || "USER"}
            </strong>

          </div>


          <div className="admin-detail-card">

            <span className="admin-detail-label">
              REGISTERED
            </span>

            <strong>
              {formatDate(customer.createdAt)}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          CUSTOMER STATISTICS
      ===================================================== */}

      <section className="admin-stats-grid">

        <div className="admin-stat-card">

          <p>ORDERS</p>

          <h2>
            {orders.length}
          </h2>

          <span>
            TOTAL ORDERS
          </span>

        </div>


        <div className="admin-stat-card">

          <p>ADDRESSES</p>

          <h2>
            {addresses.length}
          </h2>

          <span>
            SAVED ADDRESSES
          </span>

        </div>


        <div className="admin-stat-card">

          <p>ACCOUNT</p>

          <h2>
            {customer.role === "ADMIN"
              ? "ADMIN"
              : "USER"}
          </h2>

          <span>
            ACCOUNT ROLE
          </span>

        </div>

      </section>


      {/* =====================================================
          ORDERS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>ORDER HISTORY</p>

            <h2>
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </h2>

          </div>

        </div>


        {orders.length === 0 ? (

          <div className="admin-empty">

            <h3>
              No orders yet
            </h3>

            <p>
              This customer has not placed any
              orders.
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

                {orders.map((order) => (

                  <tr key={order.id}>

                    <td>

                      <strong>
                        {order.orderNumber ||
                          `#${order.id}`}
                      </strong>

                    </td>


                    <td>
                      {formatDate(
                        order.createdAt
                      )}
                    </td>


                    <td>

                      <span
                        className={`admin-status ${
                          getStatusClass(
                            order.paymentStatus
                          )
                        }`}
                      >
                        {order.paymentStatus ||
                          "PENDING"}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`admin-status ${
                          getStatusClass(
                            order.orderStatus
                          )
                        }`}
                      >
                        {order.orderStatus ||
                          "PLACED"}
                      </span>

                    </td>


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


      {/* =====================================================
          ADDRESSES
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>SAVED ADDRESSES</p>

            <h2>
              {addresses.length}{" "}
              {addresses.length === 1
                ? "Address"
                : "Addresses"}
            </h2>

          </div>

        </div>


        {addresses.length === 0 ? (

          <div className="admin-empty">

            <h3>
              No saved addresses
            </h3>

            <p>
              This customer has no saved delivery
              addresses.
            </p>

          </div>

        ) : (

          <div className="admin-customer-address-grid">

            {addresses.map((address) => (

              <div
                className="admin-detail-card"
                key={address.id}
              >

                <span className="admin-detail-label">
                  {address.type ||
                    address.label ||
                    "ADDRESS"}
                </span>

                <strong>
                  {address.name ||
                    customer.name ||
                    "—"}
                </strong>

                <p>
                  {address.addressLine1 ||
                    address.address ||
                    ""}
                  {address.addressLine2
                    ? `, ${address.addressLine2}`
                    : ""}
                  {address.city
                    ? `, ${address.city}`
                    : ""}
                  {address.state
                    ? `, ${address.state}`
                    : ""}
                  {address.postalCode
                    ? ` - ${address.postalCode}`
                    : ""}
                </p>

                {address.phone && (
                  <span>
                    {address.phone}
                  </span>
                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminCustomerDetails;