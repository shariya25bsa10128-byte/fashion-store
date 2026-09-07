import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../Admin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/dashboard`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load dashboard"
        );
      }

      setStats({
        totalUsers:
          Number(result.data?.totalUsers) || 0,

        totalProducts:
          Number(result.data?.totalProducts) || 0,

        activeProducts:
          Number(result.data?.activeProducts) || 0,

        totalOrders:
          Number(result.data?.totalOrders) || 0,

        totalReviews:
          Number(result.data?.totalReviews) || 0,
      });

    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">

        <div className="admin-loading">

          <p>
            LOADING ADMIN DASHBOARD...
          </p>

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
            FASHIONSTORE
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p className="admin-header-description">
            Manage your store, products,
            orders and customers.
          </p>

        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadDashboard}
        >
          REFRESH
        </button>

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

        {/* PRODUCTS */}

        <div className="admin-stat-card">

          <p>
            PRODUCTS
          </p>

          <h2>
            {stats.totalProducts}
          </h2>

          <span>
            {stats.activeProducts} ACTIVE
          </span>

          <Link to="/admin/products">
            MANAGE PRODUCTS →
          </Link>

        </div>


        {/* ORDERS */}

        <div className="admin-stat-card">

          <p>
            ORDERS
          </p>

          <h2>
            {stats.totalOrders}
          </h2>

          <span>
            TOTAL ORDERS
          </span>

          <Link to="/admin/orders">
            VIEW ORDERS →
          </Link>

        </div>


        {/* CUSTOMERS */}

        <div className="admin-stat-card">

          <p>
            CUSTOMERS
          </p>

          <h2>
            {stats.totalUsers}
          </h2>

          <span>
            REGISTERED USERS
          </span>

          <Link to="/admin/customers">
            VIEW CUSTOMERS →
          </Link>

        </div>


        {/* REVIEWS */}

        <div className="admin-stat-card">

          <p>
            REVIEWS
          </p>

          <h2>
            {stats.totalReviews}
          </h2>

          <span>
            PRODUCT REVIEWS
          </span>

        </div>

      </section>


      {/* =====================================================
          MANAGEMENT
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              MANAGEMENT
            </p>

            <h2>
              Store Management
            </h2>

          </div>

        </div>


        <div className="admin-management-grid">

          {/* PRODUCTS */}

          <Link
            to="/admin/products"
            className="admin-management-card"
          >

            <span>
              01
            </span>

            <h3>
              Products
            </h3>

            <p>
              Add, edit, deactivate and manage
              your FashionStore catalog.
            </p>

            <strong>
              MANAGE →
            </strong>

          </Link>


          {/* ORDERS */}

          <Link
            to="/admin/orders"
            className="admin-management-card"
          >

            <span>
              02
            </span>

            <h3>
              Orders
            </h3>

            <p>
              View customer orders and update
              delivery statuses.
            </p>

            <strong>
              MANAGE →
            </strong>

          </Link>


          {/* CUSTOMERS */}

          <Link
            to="/admin/customers"
            className="admin-management-card"
          >

            <span>
              03
            </span>

            <h3>
              Customers
            </h3>

            <p>
              View registered customers and
              their account information.
            </p>

            <strong>
              MANAGE →
            </strong>

          </Link>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              QUICK ACTIONS
            </p>

            <h2>
              Administration
            </h2>

          </div>

        </div>


        <div className="admin-quick-actions">

          <Link
            to="/admin/products"
            className="admin-action-button"
          >
            ADD / MANAGE PRODUCTS
          </Link>

          <Link
            to="/admin/orders"
            className="admin-action-button"
          >
            MANAGE ORDERS
          </Link>

          <Link
            to="/admin/customers"
            className="admin-action-button"
          >
            VIEW CUSTOMERS
          </Link>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;