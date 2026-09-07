
import { useEffect, useMemo, useState } from "react";
import "../Admin.css";

const API_URL = "http://localhost:5000/api";

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumAmount: "",
  maximumDiscount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

function AdminCoupons() {
  // =========================================================
  // STATE
  // =========================================================

  const [coupons, setCoupons] = useState([]);

  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    neverExpires: 0,
    percentageCoupons: 0,
    fixedCoupons: 0,
    totalUses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // SEARCH / FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // =========================================================
  // LOAD COUPONS
  // =========================================================

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/coupons`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load coupons."
        );
      }

      setCoupons(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "ADMIN COUPONS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD STATISTICS
  // =========================================================

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);

      const response = await fetch(
        `${API_URL}/admin/coupons/stats/summary`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load coupon statistics."
        );
      }

      setStatistics({
        total: Number(result.data?.total || 0),
        active: Number(result.data?.active || 0),
        inactive: Number(result.data?.inactive || 0),
        expired: Number(result.data?.expired || 0),
        neverExpires: Number(
          result.data?.neverExpires || 0
        ),
        percentageCoupons: Number(
          result.data?.percentageCoupons || 0
        ),
        fixedCoupons: Number(
          result.data?.fixedCoupons || 0
        ),
        totalUses: Number(
          result.data?.totalUses || 0
        ),
      });
    } catch (err) {
      console.error(
        "ADMIN COUPON STATS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load coupon statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  const loadAll = async () => {
    await Promise.all([
      loadCoupons(),
      loadStatistics(),
    ]);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAll();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  const openCreateForm = () => {
    setEditingCoupon(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);

    let formattedExpiry = "";

    if (coupon.expiresAt) {
      const date = new Date(
        coupon.expiresAt
      );

      if (!Number.isNaN(date.getTime())) {
        formattedExpiry = date
          .toISOString()
          .slice(0, 16);
      }
    }

    setForm({
      code: coupon.code || "",

      discountType:
        coupon.discountType ||
        "PERCENTAGE",

      discountValue:
        coupon.discountValue ?? "",

      minimumAmount:
        coupon.minimumAmount ?? "",

      maximumDiscount:
        coupon.maximumDiscount ?? "",

      usageLimit:
        coupon.usageLimit ?? "",

      expiresAt:
        formattedExpiry,

      isActive:
        coupon.isActive !== false,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCoupon(null);

    setForm({
      ...EMPTY_FORM,
    });
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    const code = form.code.trim();

    if (!code) {
      return "Coupon code is required.";
    }

    if (!form.discountValue) {
      return "Discount value is required.";
    }

    const discountValue =
      Number(form.discountValue);

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      return "Discount value must be greater than 0.";
    }

    if (
      form.discountType ===
        "PERCENTAGE" &&
      discountValue > 100
    ) {
      return "Percentage discount cannot exceed 100%.";
    }

    if (form.minimumAmount !== "") {
      const minimumAmount =
        Number(form.minimumAmount);

      if (
        !Number.isFinite(minimumAmount) ||
        minimumAmount < 0
      ) {
        return "Minimum amount must be 0 or greater.";
      }
    }

    if (form.maximumDiscount !== "") {
      const maximumDiscount =
        Number(form.maximumDiscount);

      if (
        !Number.isFinite(maximumDiscount) ||
        maximumDiscount <= 0
      ) {
        return "Maximum discount must be greater than 0.";
      }
    }

    if (form.usageLimit !== "") {
      const usageLimit =
        Number(form.usageLimit);

      if (
        !Number.isInteger(usageLimit) ||
        usageLimit < 1
      ) {
        return "Usage limit must be at least 1.";
      }
    }

    if (form.expiresAt !== "") {
      const expiryDate =
        new Date(form.expiresAt);

      if (
        Number.isNaN(
          expiryDate.getTime()
        )
      ) {
        return "Invalid expiry date.";
      }
    }

    return "";
  };

  // =========================================================
  // SAVE COUPON
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        discountType:
          form.discountType,

        discountValue:
          Number(form.discountValue),

        minimumAmount:
          form.minimumAmount === ""
            ? 0
            : Number(form.minimumAmount),

        maximumDiscount:
          form.maximumDiscount === ""
            ? null
            : Number(
                form.maximumDiscount
              ),

        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),

        expiresAt:
          form.expiresAt === ""
            ? null
            : new Date(
                form.expiresAt
              ).toISOString(),

        isActive:
          Boolean(form.isActive),
      };

      const isEditing =
        Boolean(editingCoupon);

      const url = isEditing
        ? `${API_URL}/admin/coupons/${editingCoupon.id}`
        : `${API_URL}/admin/coupons`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to save coupon."
        );
      }

      setSuccess(
        isEditing
          ? "Coupon updated successfully."
          : "Coupon created successfully."
      );

      setShowForm(false);
      setEditingCoupon(null);

      setForm({
        ...EMPTY_FORM,
      });

      await loadAll();
    } catch (err) {
      console.error(
        "SAVE COUPON ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to save coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const toggleStatus = async (coupon) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/coupons/${coupon.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            isActive:
              !coupon.isActive,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update coupon status."
        );
      }

      setSuccess(
        coupon.isActive
          ? "Coupon deactivated successfully."
          : "Coupon activated successfully."
      );

      await loadAll();
    } catch (err) {
      console.error(
        "TOGGLE COUPON ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to update coupon status."
      );
    }
  };

  // =========================================================
  // DELETE COUPON
  // =========================================================

  const deleteCoupon = async (coupon) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete coupon "${coupon.code}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/coupons/${coupon.id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete coupon."
        );
      }

      setSuccess(
        "Coupon deleted successfully."
      );

      await loadAll();
    } catch (err) {
      console.error(
        "DELETE COUPON ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete coupon."
      );
    }
  };

  // =========================================================
  // FORMAT DISCOUNT
  // =========================================================

  const formatDiscount = (coupon) => {
    if (
      String(
        coupon.discountType || ""
      ).toUpperCase() ===
      "PERCENTAGE"
    ) {
      return `${coupon.discountValue}%`;
    }

    return `₹${Number(
      coupon.discountValue || 0
    ).toLocaleString("en-IN")}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "NO EXPIRY";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "NO EXPIRY";
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

  // =========================================================
  // CHECK EXPIRED
  // =========================================================

  const isExpired = (coupon) => {
    if (!coupon.expiresAt) {
      return false;
    }

    const expiry =
      new Date(coupon.expiresAt);

    return (
      !Number.isNaN(
        expiry.getTime()
      ) &&
      expiry < new Date()
    );
  };

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const filteredCoupons =
    useMemo(() => {
      let result = [...coupons];

      // SEARCH
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (search) {
        result =
          result.filter(
            (coupon) =>
              String(
                coupon.code || ""
              )
                .toLowerCase()
                .includes(search)
          );
      }

      // STATUS
      if (
        statusFilter ===
        "ACTIVE"
      ) {
        result =
          result.filter(
            (coupon) =>
              coupon.isActive === true
          );
      }

      if (
        statusFilter ===
        "INACTIVE"
      ) {
        result =
          result.filter(
            (coupon) =>
              coupon.isActive === false
          );
      }

      if (
        statusFilter ===
        "EXPIRED"
      ) {
        result =
          result.filter(
            (coupon) =>
              isExpired(coupon)
          );
      }

      // TYPE
      if (
        typeFilter !== "ALL"
      ) {
        result =
          result.filter(
            (coupon) =>
              String(
                coupon.discountType ||
                  ""
              ).toUpperCase() ===
              typeFilter
          );
      }

      // SORT
      result.sort(
        (a, b) => {
          if (
            sortBy ===
            "NEWEST"
          ) {
            return (
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
            );
          }

          if (
            sortBy ===
            "OLDEST"
          ) {
            return (
              new Date(
                a.createdAt
              ) -
              new Date(
                b.createdAt
              )
            );
          }

          if (
            sortBy ===
            "CODE_ASC"
          ) {
            return String(
              a.code || ""
            ).localeCompare(
              String(
                b.code || ""
              )
            );
          }

          if (
            sortBy ===
            "DISCOUNT_HIGH"
          ) {
            return (
              Number(
                b.discountValue || 0
              ) -
              Number(
                a.discountValue || 0
              )
            );
          }

          return 0;
        }
      );

      return result;
    }, [
      coupons,
      searchTerm,
      statusFilter,
      typeFilter,
      sortBy,
    ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>
            LOADING COUPONS...
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
            Coupons
          </h1>

          <p className="admin-header-description">
            Create and manage discount
            coupons for your customers.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadAll}
            disabled={
              loading ||
              statsLoading
            }
          >
            REFRESH
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openCreateForm}
          >
            + ADD COUPON
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
          STATISTICS
      ===================================================== */}

      <section className="admin-stats-grid">

        {/* TOTAL */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              TOTAL COUPONS
            </span>

            <span>
              🎟
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.total}
          </strong>

          <small>
            All created coupons
          </small>

        </div>

        {/* ACTIVE */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              ACTIVE
            </span>

            <span>
              ✓
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.active}
          </strong>

          <small>
            Currently enabled
          </small>

        </div>

        {/* INACTIVE */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              INACTIVE
            </span>

            <span>
              ○
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.inactive}
          </strong>

          <small>
            Currently disabled
          </small>

        </div>

        {/* EXPIRED */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              EXPIRED
            </span>

            <span>
              !
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.expired}
          </strong>

          <small>
            Past expiry date
          </small>

        </div>

        {/* NEVER EXPIRES */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              NEVER EXPIRES
            </span>

            <span>
              ∞
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.neverExpires}
          </strong>

          <small>
            No expiry configured
          </small>

        </div>

        {/* TOTAL USES */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              TOTAL USES
            </span>

            <span>
              ↗
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.totalUses.toLocaleString(
                  "en-IN"
                )}
          </strong>

          <small>
            Coupon redemptions
          </small>

        </div>

        {/* PERCENTAGE */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              PERCENTAGE
            </span>

            <span>
              %
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.percentageCoupons}
          </strong>

          <small>
            Percentage discount coupons
          </small>

        </div>

        {/* FIXED */}

        <div className="admin-stat-card">

          <div className="admin-stat-card-top">
            <span>
              FIXED
            </span>

            <span>
              ₹
            </span>
          </div>

          <strong>
            {statsLoading
              ? "—"
              : statistics.fixedCoupons}
          </strong>

          <small>
            Fixed amount coupons
          </small>

        </div>

      </section>

      {/* =====================================================
          CREATE / EDIT FORM
      ===================================================== */}

      {showForm && (
        <section className="admin-section">

          <div className="admin-section-heading">

            <div>

              <p>
                {editingCoupon
                  ? "EDIT COUPON"
                  : "NEW COUPON"}
              </p>

              <h2>
                {editingCoupon
                  ? "Update Coupon"
                  : "Create Coupon"}
              </h2>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-form"
          >

            {/* CODE */}

            <div className="admin-form-group">

              <label htmlFor="code">
                Coupon Code
              </label>

              <input
                id="code"
                name="code"
                type="text"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. WELCOME10"
                maxLength={50}
                autoComplete="off"
                required
              />

            </div>

            {/* DISCOUNT TYPE */}

            <div className="admin-form-group">

              <label htmlFor="discountType">
                Discount Type
              </label>

              <select
                id="discountType"
                name="discountType"
                value={
                  form.discountType
                }
                onChange={handleChange}
              >

                <option value="PERCENTAGE">
                  Percentage
                </option>

                <option value="FIXED">
                  Fixed Amount
                </option>

              </select>

            </div>

            {/* DISCOUNT VALUE */}

            <div className="admin-form-group">

              <label htmlFor="discountValue">
                Discount Value
              </label>

              <input
                id="discountValue"
                name="discountValue"
                type="number"
                min="1"
                step="1"
                value={
                  form.discountValue
                }
                onChange={handleChange}
                placeholder={
                  form.discountType ===
                  "PERCENTAGE"
                    ? "10"
                    : "500"
                }
                required
              />

              <small>
                {form.discountType ===
                "PERCENTAGE"
                  ? "Enter a value between 1% and 100%."
                  : "Enter the fixed rupee discount amount."}
              </small>

            </div>

            {/* MINIMUM AMOUNT */}

            <div className="admin-form-group">

              <label htmlFor="minimumAmount">
                Minimum Order Amount
              </label>

              <input
                id="minimumAmount"
                name="minimumAmount"
                type="number"
                min="0"
                step="1"
                value={
                  form.minimumAmount
                }
                onChange={handleChange}
                placeholder="0"
              />

              <small>
                Leave as 0 if there is no
                minimum order requirement.
              </small>

            </div>

            {/* MAXIMUM DISCOUNT */}

            <div className="admin-form-group">

              <label htmlFor="maximumDiscount">
                Maximum Discount
              </label>

              <input
                id="maximumDiscount"
                name="maximumDiscount"
                type="number"
                min="1"
                step="1"
                value={
                  form.maximumDiscount
                }
                onChange={handleChange}
                placeholder={
                  form.discountType ===
                  "PERCENTAGE"
                    ? "Optional"
                    : "Not required"
                }
                disabled={
                  form.discountType ===
                  "FIXED"
                }
              />

              <small>
                {form.discountType ===
                "PERCENTAGE"
                  ? "Optional cap for percentage discounts."
                  : "Maximum discount is only needed for percentage coupons."}
              </small>

            </div>

            {/* USAGE LIMIT */}

            <div className="admin-form-group">

              <label htmlFor="usageLimit">
                Usage Limit
              </label>

              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min="1"
                step="1"
                value={
                  form.usageLimit
                }
                onChange={handleChange}
                placeholder="Unlimited"
              />

              <small>
                Leave empty for unlimited
                usage.
              </small>

            </div>

            {/* EXPIRY */}

            <div className="admin-form-group">

              <label htmlFor="expiresAt">
                Expiry Date
              </label>

              <input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                value={
                  form.expiresAt
                }
                onChange={handleChange}
              />

              <small>
                Leave empty if the coupon
                never expires.
              </small>

            </div>

            {/* ACTIVE */}

            <div className="admin-form-group">

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    form.isActive
                  }
                  onChange={handleChange}
                />

                Coupon Active

              </label>

            </div>

            {/* ACTIONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >

                {saving
                  ? "SAVING..."
                  : editingCoupon
                  ? "UPDATE COUPON"
                  : "CREATE COUPON"}

              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                CANCEL
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =====================================================
          COUPON LIST
      ===================================================== */}

      <section className="admin-section">

        {/* HEADING */}

        <div className="admin-section-heading">

          <div>

            <p>
              DISCOUNT MANAGEMENT
            </p>

            <h2>
              All Coupons
            </h2>

          </div>

          <span>
            {filteredCoupons.length}
            {" / "}
            {coupons.length}
            {" COUPON"}
            {coupons.length !== 1
              ? "S"
              : ""}
          </span>

        </div>

        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) repeat(3, minmax(150px, 180px))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >

          {/* SEARCH */}

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search coupon code..."
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

            <option value="EXPIRED">
              Expired
            </option>

          </select>

          {/* TYPE */}

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Types
            </option>

            <option value="PERCENTAGE">
              Percentage
            </option>

            <option value="FIXED">
              Fixed
            </option>

          </select>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
          >

            <option value="NEWEST">
              Newest
            </option>

            <option value="OLDEST">
              Oldest
            </option>

            <option value="CODE_ASC">
              Code A–Z
            </option>

            <option value="DISCOUNT_HIGH">
              Highest Discount
            </option>

          </select>

        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {coupons.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No coupons yet
            </h3>

            <p>
              Create your first discount
              coupon to get started.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreateForm}
            >
              + ADD COUPON
            </button>

          </div>

        ) : filteredCoupons.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No matching coupons
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setTypeFilter("ALL");
              }}
            >
              CLEAR FILTERS
            </button>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    CODE
                  </th>

                  <th>
                    DISCOUNT
                  </th>

                  <th>
                    MINIMUM
                  </th>

                  <th>
                    USAGE
                  </th>

                  <th>
                    EXPIRES
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTIONS
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCoupons.map(
                  (coupon) => {

                    const expired =
                      isExpired(
                        coupon
                      );

                    return (
                      <tr
                        key={
                          coupon.id
                        }
                      >

                        {/* CODE */}

                        <td>

                          <strong>
                            {
                              coupon.code
                            }
                          </strong>

                        </td>

                        {/* DISCOUNT */}

                        <td>

                          <strong>
                            {formatDiscount(
                              coupon
                            )}
                          </strong>

                          <br />

                          <small>
                            {String(
                              coupon.discountType ||
                                ""
                            ).toUpperCase()}
                          </small>

                          {coupon.maximumDiscount &&
                            coupon.discountType ===
                              "PERCENTAGE" && (
                              <>
                                <br />

                                <small>
                                  Max ₹
                                  {Number(
                                    coupon.maximumDiscount
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </small>
                              </>
                            )}

                        </td>

                        {/* MINIMUM */}

                        <td>

                          ₹
                          {Number(
                            coupon.minimumAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* USAGE */}

                        <td>

                          {coupon.usedCount ||
                            0}

                          {" / "}

                          {coupon.usageLimit ??
                            "∞"}

                        </td>

                        {/* EXPIRY */}

                        <td>

                          <span
                            style={{
                              color:
                                expired
                                  ? "#b91c1c"
                                  : "inherit",
                              fontWeight:
                                expired
                                  ? 600
                                  : "normal",
                            }}
                          >
                            {formatDate(
                              coupon.expiresAt
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          {expired ? (

                            <span className="admin-status inactive">
                              EXPIRED
                            </span>

                          ) : (

                            <span
                              className={
                                coupon.isActive
                                  ? "admin-status active"
                                  : "admin-status inactive"
                              }
                            >
                              {coupon.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <button
                              type="button"
                              className="admin-small-button"
                              onClick={() =>
                                openEditForm(
                                  coupon
                                )
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="admin-small-button"
                              onClick={() =>
                                toggleStatus(
                                  coupon
                                )
                              }
                            >

                              {coupon.isActive
                                ? "DISABLE"
                                : "ENABLE"}

                            </button>

                            <button
                              type="button"
                              className="admin-small-button admin-danger-button"
                              onClick={() =>
                                deleteCoupon(
                                  coupon
                                )
                              }
                            >
                              DELETE
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default AdminCoupons;
