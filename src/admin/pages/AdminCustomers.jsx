import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../admin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/customers`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load customers"
        );
      }

      const customerData = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.customers)
        ? result.customers
        : [];

      setCustomers(customerData);
    } catch (error) {
      console.error(
        "ADMIN CUSTOMERS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load customers. Make sure the backend server is running."
      );

      setCustomers([]);
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
  // FILTER CUSTOMERS
  // =========================================================

  const filteredCustomers = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return customers.filter((customer) => {
      const role = String(
        customer.role || ""
      ).toUpperCase();

      const matchesRole =
        roleFilter === "ALL" ||
        role === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const name = String(
        customer.name || ""
      ).toLowerCase();

      const username = String(
        customer.username || ""
      ).toLowerCase();

      const email = String(
        customer.email || ""
      ).toLowerCase();

      const phone = String(
        customer.phone || ""
      ).toLowerCase();

      return (
        name.includes(searchValue) ||
        username.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue)
      );
    });
  }, [customers, search, roleFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = customers.length;

    const admins = customers.filter(
      (customer) =>
        String(customer.role || "").toUpperCase() ===
        "ADMIN"
    ).length;

    const users = customers.filter(
      (customer) =>
        String(customer.role || "").toUpperCase() ===
        "USER"
    ).length;

    return {
      total,
      users,
      admins,
    };
  }, [customers]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>LOADING CUSTOMERS...</p>
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
            Customers
          </h1>

          <p className="admin-header-description">
            View registered customers and manage
            their account information.
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
            onClick={loadCustomers}
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
          <p>CUSTOMERS</p>

          <h2>
            {statistics.total}
          </h2>

          <span>
            REGISTERED USERS
          </span>
        </div>


        <div className="admin-stat-card">
          <p>USERS</p>

          <h2>
            {statistics.users}
          </h2>

          <span>
            CUSTOMER ACCOUNTS
          </span>
        </div>


        <div className="admin-stat-card">
          <p>ADMINS</p>

          <h2>
            {statistics.admins}
          </h2>

          <span>
            ADMIN ACCOUNTS
          </span>
        </div>


        <div className="admin-stat-card">
          <p>RESULTS</p>

          <h2>
            {filteredCustomers.length}
          </h2>

          <span>
            CURRENTLY DISPLAYED
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
            placeholder="Search by name, username, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="ALL">
              ALL ROLES
            </option>

            <option value="USER">
              USERS
            </option>

            <option value="ADMIN">
              ADMINS
            </option>
          </select>

          <button
            type="button"
            className="admin-primary-button"
            onClick={loadCustomers}
          >
            REFRESH
          </button>

        </div>

      </section>


      {/* =====================================================
          CUSTOMERS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <p>
              CUSTOMER MANAGEMENT
            </p>

            <h2>
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1
                ? "Customer"
                : "Customers"}
            </h2>
          </div>

        </div>


        {filteredCustomers.length === 0 ? (

          <div className="admin-empty">

            <h3>
              No customers found
            </h3>

            <p>
              Try changing your search or role filter.
            </p>

          </div>

        ) : (

          <div className="admin-orders-table-wrapper">

            <table className="admin-orders-table">

              <thead>
                <tr>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    EMAIL
                  </th>

                  <th>
                    PHONE
                  </th>

                  <th>
                    ROLE
                  </th>

                  <th>
                    JOINED
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>
              </thead>


              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    {/* CUSTOMER */}

                    <td>

                      <div className="admin-customer-cell">

                        <strong>
                          {customer.name ||
                            customer.username ||
                            "Customer"}
                        </strong>

                        {customer.username && (
                          <span>
                            @{customer.username}
                          </span>
                        )}

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td>
                      {customer.email || "—"}
                    </td>


                    {/* PHONE */}

                    <td>
                      {customer.phone || "—"}
                    </td>


                    {/* ROLE */}

                    <td>

                      <span
                        className={`admin-status ${
                          String(
                            customer.role || "USER"
                          ).toLowerCase()
                        }`}
                      >
                        {customer.role || "USER"}
                      </span>

                    </td>


                    {/* JOINED */}

                    <td>
                      {formatDate(
                        customer.createdAt
                      )}
                    </td>


                    {/* ACTION */}

                    <td>

                      <Link
                        to={`/admin/customers/${customer.id}`}
                        className="admin-table-action"
                      >
                        VIEW →
                      </Link>

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

export default AdminCustomers;