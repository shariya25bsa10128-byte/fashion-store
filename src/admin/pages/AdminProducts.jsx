import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../admin.css";

// =========================================================
// API URLS
// =========================================================

// Normal product API
// Used for creating and editing products.
const API_URL = "http://localhost:5000/api/products";

// Admin product API
// Used for loading ALL products, including inactive products,
// and activating/deactivating products.
const ADMIN_API_URL =
  "http://localhost:5000/api/admin/products";

// =========================================================
// EMPTY FORM
// =========================================================

const emptyForm = {
  name: "",
  description: "",
  category: "Men",
  subcategory: "",
  price: "",
  oldPrice: "",
  image: "",
  badge: "",
  isNew: false,
  isSale: false,
  isActive: true,
};

// =========================================================
// ADMIN PRODUCTS
// =========================================================

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // Admin endpoint returns BOTH active and inactive products.
      const response = await fetch(
        ADMIN_API_URL
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load products"
        );
      }

      const result = await response.json();

      let productList = [];

      if (Array.isArray(result?.data)) {
        productList = result.data;
      } else if (
        Array.isArray(result?.products)
      ) {
        productList = result.products;
      } else if (Array.isArray(result)) {
        productList = result;
      }

      setProducts(productList);
    } catch (err) {
      console.error(
        "ADMIN PRODUCTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products. Make sure the backend server is running."
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

    setError("");
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
      isActive: true,
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description:
        product.description || "",
      category:
        product.category || "Men",
      subcategory:
        product.subcategory || "",
      price:
        product.price ?? "",
      oldPrice:
        product.oldPrice ?? "",
      image:
        product.image || "",
      badge:
        product.badge || "",
      isNew:
        Boolean(product.isNew),
      isSale:
        Boolean(product.isSale),
      isActive:
        Boolean(product.isActive),
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
    setEditingProduct(null);
    setForm(emptyForm);
  };

  // =========================================================
  // SAVE PRODUCT
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!form.category) {
      setError(
        "Product category is required."
      );
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Please enter a valid product price."
      );
      return;
    }

    if (!form.image.trim()) {
      setError(
        "Product image URL is required."
      );
      return;
    }

    if (
      form.oldPrice !== "" &&
      Number(form.oldPrice) < 0
    ) {
      setError(
        "Please enter a valid old price."
      );
      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {
      name: form.name.trim(),

      description:
        form.description.trim() || null,

      category:
        form.category,

      subcategory:
        form.subcategory.trim() || null,

      price:
        Number(form.price),

      oldPrice:
        form.oldPrice === ""
          ? null
          : Number(form.oldPrice),

      image:
        form.image.trim(),

      badge:
        form.badge.trim() || null,

      isNew:
        Boolean(form.isNew),

      isSale:
        Boolean(form.isSale),

      isActive:
        Boolean(form.isActive),
    };

    try {
      setSaving(true);

      // -----------------------------------------------------
      // CREATE OR UPDATE
      // -----------------------------------------------------

      const url = editingProduct
        ? `${API_URL}/${editingProduct.id}`
        : API_URL;

      const method = editingProduct
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

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to save product."
        );
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

      // Reload ALL products from admin endpoint.
      await loadProducts();
    } catch (err) {
      console.error(
        "SAVE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DEACTIVATE PRODUCT
  // =========================================================

  const handleDeactivate = async (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${ADMIN_API_URL}/${product.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            isActive: false,
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
          result?.message ||
            "Unable to deactivate product."
        );
      }

      setSuccess(
        "Product deactivated successfully."
      );

      await loadProducts();
    } catch (err) {
      console.error(
        "DEACTIVATE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate product."
      );
    }
  };

  // =========================================================
  // ACTIVATE PRODUCT
  // =========================================================

  const handleActivate = async (
    product
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${ADMIN_API_URL}/${product.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            isActive: true,
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
          result?.message ||
            "Unable to activate product."
        );
      }

      setSuccess(
        "Product activated successfully."
      );

      await loadProducts();
    } catch (err) {
      console.error(
        "ACTIVATE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate product."
      );
    }
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts =
    products.filter((product) => {
      const searchValue =
        search.trim().toLowerCase();

      const productName =
        String(
          product.name || ""
        ).toLowerCase();

      const productCategory =
        String(
          product.category || ""
        ).toLowerCase();

      const productSubcategory =
        String(
          product.subcategory || ""
        ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        productName.includes(
          searchValue
        ) ||
        productCategory.includes(
          searchValue
        ) ||
        productSubcategory.includes(
          searchValue
        );

      const matchesCategory =
        categoryFilter === "ALL" ||
        product.category ===
          categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          Boolean(
            product.isActive
          )) ||
        (statusFilter ===
          "INACTIVE" &&
          !Boolean(
            product.isActive
          ));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(amount) || 0
    );
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        Boolean(
          product.isActive
        )
    ).length;

  const inactiveProducts =
    products.filter(
      (product) =>
        !Boolean(
          product.isActive
        )
    ).length;

  const saleProducts =
    products.filter(
      (product) =>
        Boolean(
          product.isSale
        )
    ).length;

  const newProducts =
    products.filter(
      (product) =>
        Boolean(
          product.isNew
        )
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <p>
            LOADING PRODUCTS...
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
            ADMIN PANEL
          </p>

          <h1>
            Products
          </h1>

          <p className="admin-header-description">
            Add, edit, deactivate and
            manage your FashionStore
            product catalog.
          </p>

        </div>

        <div className="admin-header-actions">

          <Link
            to="/admin"
            className="admin-secondary-button"
          >
            ← DASHBOARD
          </Link>

          <button
            type="button"
            className="admin-primary-button"
            onClick={
              openAddForm
            }
          >
            + ADD PRODUCT
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
          SUMMARY
      ===================================================== */}

      <section className="admin-product-summary">

        <div>

          <span>
            TOTAL PRODUCTS
          </span>

          <strong>
            {totalProducts}
          </strong>

        </div>


        <div>

          <span>
            ACTIVE
          </span>

          <strong>
            {activeProducts}
          </strong>

        </div>


        <div>

          <span>
            INACTIVE
          </span>

          <strong>
            {inactiveProducts}
          </strong>

        </div>


        <div>

          <span>
            ON SALE
          </span>

          <strong>
            {saleProducts}
          </strong>

        </div>


        <div>

          <span>
            NEW ARRIVALS
          </span>

          <strong>
            {newProducts}
          </strong>

        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="admin-product-toolbar">

        <div className="admin-search-box">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={
            categoryFilter
          }
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >

          <option value="ALL">
            ALL CATEGORIES
          </option>

          <option value="Men">
            MEN
          </option>

          <option value="Women">
            WOMEN
          </option>

          <option value="Kids">
            KIDS
          </option>

        </select>


        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="ALL">
            ALL STATUS
          </option>

          <option value="ACTIVE">
            ACTIVE
          </option>

          <option value="INACTIVE">
            INACTIVE
          </option>

        </select>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={
            loadProducts
          }
        >
          REFRESH
        </button>

      </section>


      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      {filteredProducts.length ===
      0 ? (

        <section className="admin-empty">

          <h2>
            No products found
          </h2>

          <p>
            Try changing your
            search or filters,
            or add a new product.
          </p>

        </section>

      ) : (

        <section className="admin-products-grid">

          {filteredProducts.map(
            (product) => (

              <article
                className={`admin-product-card ${
                  !product.isActive
                    ? "inactive"
                    : ""
                }`}
                key={
                  product.id
                }
              >

                {/* =================================================
                    IMAGE
                ================================================= */}

                <div className="admin-product-image">

                  <img
                    src={
                      product.image
                    }
                    alt={
                      product.name
                    }
                  />

                  {product.badge && (
                    <span className="admin-product-badge">
                      {
                        product.badge
                      }
                    </span>
                  )}

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="admin-product-content">

                  <div className="admin-product-top">

                    <span className="admin-product-category">
                      {
                        product.category
                      }
                    </span>


                    <span
                      className={`admin-product-status ${
                        product.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {product.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                  </div>


                  <h3>
                    {
                      product.name
                    }
                  </h3>


                  {product.description && (
                    <p className="admin-product-description">
                      {
                        product.description
                      }
                    </p>
                  )}


                  <div className="admin-product-price">

                    <strong>
                      {
                        formatCurrency(
                          product.price
                        )
                      }
                    </strong>


                    {product.oldPrice && (
                      <del>
                        {
                          formatCurrency(
                            product.oldPrice
                          )
                        }
                      </del>
                    )}

                  </div>


                  {/* =================================================
                      TAGS
                  ================================================= */}

                  <div className="admin-product-tags">

                    {product.isNew && (
                      <span>
                        NEW
                      </span>
                    )}

                    {product.isSale && (
                      <span>
                        SALE
                      </span>
                    )}

                  </div>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="admin-product-actions">

                    {/* EDIT */}

                    <button
                      type="button"
                      className="admin-edit-button"
                      onClick={() =>
                        openEditForm(
                          product
                        )
                      }
                    >
                      EDIT
                    </button>


                    {/* ACTIVE PRODUCT */}

                    {product.isActive ? (

                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() =>
                          handleDeactivate(
                            product
                          )
                        }
                      >
                        DEACTIVATE
                      </button>

                    ) : (

                      /* INACTIVE PRODUCT */

                      <button
                        type="button"
                        className="admin-primary-button"
                        onClick={() =>
                          handleActivate(
                            product
                          )
                        }
                      >
                        ACTIVATE
                      </button>

                    )}

                  </div>

                </div>

              </article>

            )
          )}

        </section>

      )}


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="admin-modal-header">

              <div>

                <p className="admin-eyebrow">
                  {editingProduct
                    ? "EDIT PRODUCT"
                    : "NEW PRODUCT"}
                </p>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeForm
                }
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="admin-product-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* NAME */}

              <div className="admin-form-group">

                <label>
                  PRODUCT NAME
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Oversized Cotton Shirt"
                  disabled={saving}
                />

              </div>


              {/* DESCRIPTION */}

              <div className="admin-form-group">

                <label>
                  DESCRIPTION
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the product..."
                  rows="4"
                  disabled={saving}
                />

              </div>


              {/* CATEGORY ROW */}

              <div className="admin-form-row">

                <div className="admin-form-group">

                  <label>
                    CATEGORY
                  </label>

                  <select
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  >

                    <option value="Men">
                      Men
                    </option>

                    <option value="Women">
                      Women
                    </option>

                    <option value="Kids">
                      Kids
                    </option>

                  </select>

                </div>


                <div className="admin-form-group">

                  <label>
                    SUBCATEGORY
                  </label>

                  <input
                    type="text"
                    name="subcategory"
                    value={
                      form.subcategory
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Shirts, Dresses..."
                    disabled={saving}
                  />

                </div>

              </div>


              {/* PRICE ROW */}

              <div className="admin-form-row">

                <div className="admin-form-group">

                  <label>
                    PRICE (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={
                      form.price
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1299"
                    disabled={saving}
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    OLD PRICE (₹)
                  </label>

                  <input
                    type="number"
                    name="oldPrice"
                    min="0"
                    value={
                      form.oldPrice
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1799"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* IMAGE */}

              <div className="admin-form-group">

                <label>
                  IMAGE URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={
                    form.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                  disabled={saving}
                />

              </div>


              {/* BADGE */}

              <div className="admin-form-group">

                <label>
                  BADGE
                </label>

                <input
                  type="text"
                  name="badge"
                  value={
                    form.badge
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="NEW / BESTSELLER / SALE"
                  disabled={saving}
                />

              </div>


              {/* CHECKBOXES */}

              <div className="admin-form-checkboxes">

                <label>

                  <input
                    type="checkbox"
                    name="isNew"
                    checked={
                      form.isNew
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                  <span>
                    New Arrival
                  </span>

                </label>


                <label>

                  <input
                    type="checkbox"
                    name="isSale"
                    checked={
                      form.isSale
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                  <span>
                    On Sale
                  </span>

                </label>


                <label>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      form.isActive
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                  <span>
                    Active Product
                  </span>

                </label>

              </div>


              {/* MODAL ACTIONS */}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "SAVING..."
                    : editingProduct
                    ? "UPDATE PRODUCT"
                    : "CREATE PRODUCT"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default AdminProducts;