import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  ArrowLeft,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Address.css";

const API_URL = "http://localhost:5000";

function Address() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  // =========================================================
  // LOAD ADDRESSES
  // =========================================================

  const loadAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/addresses?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load addresses"
        );
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Load addresses error:", error);

      setError(
        "Unable to load your addresses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN USER IS AVAILABLE
  // =========================================================

  useEffect(() => {
    if (!authLoading && isLoggedIn && user?.id) {
      loadAddresses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, user]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      fullName: user?.name || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });

    setEditingAddress(null);
    setShowForm(false);
    setError("");
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddAddress = () => {
    setEditingAddress(null);

    setFormData({
      fullName: user?.name || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: addresses.length === 0,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditAddress = (address) => {
    setEditingAddress(address);

    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isDefault: Boolean(address.isDefault),
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!formData.addressLine1.trim()) {
      setError("Please enter your address.");
      return false;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return false;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state.");
      return false;
    }

    if (!formData.postalCode.trim()) {
      setError("Please enter your postal code.");
      return false;
    }

    return true;
  };

  // =========================================================
  // SAVE ADDRESS
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setError("Your account information is missing.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        userId: user.id,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim() || "India",
        isDefault: formData.isDefault,
      };

      const url = editingAddress
        ? `${API_URL}/api/addresses/${editingAddress.id}`
        : `${API_URL}/api/addresses`;

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save address"
        );
      }

      setSuccess(
        editingAddress
          ? "Address updated successfully."
          : "Address added successfully."
      );

      setShowForm(false);
      setEditingAddress(null);

      await loadAddresses();
    } catch (error) {
      console.error("Save address error:", error);

      setError(
        error.message ||
          "Unable to save your address. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SET DEFAULT ADDRESS
  // =========================================================

  const handleSetDefault = async (addressId) => {
    if (!user?.id) {
      setError("Your account information is missing.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/addresses/${addressId}/default`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update default address"
        );
      }

      setSuccess("Default address updated successfully.");

      await loadAddresses();
    } catch (error) {
      console.error(
        "Set default address error:",
        error
      );

      setError(
        error.message ||
          "Unable to update your default address."
      );
    }
  };

  // =========================================================
  // DELETE ADDRESS
  // =========================================================

  const handleDelete = async (addressId) => {
    if (!user?.id) {
      setError("Your account information is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/addresses/${addressId}?userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete address"
        );
      }

      setSuccess("Address deleted successfully.");

      await loadAddresses();
    } catch (error) {
      console.error("Delete address error:", error);

      setError(
        error.message ||
          "Unable to delete your address."
      );
    }
  };

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (authLoading) {
    return (
      <main className="address-page">
        <section className="address-loading">
          <MapPin size={32} />

          <p>Loading your account...</p>
        </section>
      </main>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!isLoggedIn || !user) {
    return (
      <main className="address-page">
        <section className="address-login-required">
          <div className="address-login-icon">
            <MapPin size={34} />
          </div>

          <p className="address-eyebrow">
            FASHIONSTORE
          </p>

          <h1>
            Sign in to manage
            <br />
            your addresses
          </h1>

          <p>
            Please sign in to add, edit, and manage
            your delivery addresses.
          </p>

          <Link
            to="/login"
            className="address-primary-button"
          >
            SIGN IN
          </Link>
        </section>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="address-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="address-header">

        <div>
          <p className="address-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            My Addresses
          </h1>

          <p>
            Manage your delivery addresses for
            a faster checkout experience.
          </p>
        </div>

        <button
          type="button"
          className="address-add-button"
          onClick={handleAddAddress}
        >
          <Plus size={18} />
          ADD NEW ADDRESS
        </button>

      </section>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="address-message address-error">
          {error}
        </div>
      )}

      {success && (
        <div className="address-message address-success">
          {success}
        </div>
      )}


      {/* =====================================================
          FORM
      ===================================================== */}

      {showForm && (
        <section className="address-form-card">

          <div className="address-form-header">

            <div>
              <p className="address-card-label">
                {editingAddress
                  ? "EDIT ADDRESS"
                  : "NEW ADDRESS"}
              </p>

              <h2>
                {editingAddress
                  ? "Update Address"
                  : "Add Address"}
              </h2>
            </div>

            <button
              type="button"
              className="address-close-button"
              onClick={resetForm}
              disabled={saving}
              aria-label="Close"
            >
              <X size={20} />
            </button>

          </div>


          <form
            className="address-form"
            onSubmit={handleSubmit}
          >

            <div className="address-form-grid">

              {/* FULL NAME */}

              <div className="address-field">
                <label htmlFor="fullName">
                  FULL NAME
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>


              {/* PHONE */}

              <div className="address-field">
                <label htmlFor="phone">
                  PHONE NUMBER
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={saving}
                />
              </div>


              {/* ADDRESS LINE 1 */}

              <div className="address-field address-field-full">
                <label htmlFor="addressLine1">
                  ADDRESS LINE 1
                </label>

                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  placeholder="House no., building, street"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>


              {/* ADDRESS LINE 2 */}

              <div className="address-field address-field-full">
                <label htmlFor="addressLine2">
                  ADDRESS LINE 2
                  <span>OPTIONAL</span>
                </label>

                <input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  placeholder="Apartment, landmark, etc."
                  value={formData.addressLine2}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>


              {/* CITY */}

              <div className="address-field">
                <label htmlFor="city">
                  CITY
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>


              {/* STATE */}

              <div className="address-field">
                <label htmlFor="state">
                  STATE
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>


              {/* POSTAL CODE */}

              <div className="address-field">
                <label htmlFor="postalCode">
                  POSTAL CODE
                </label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  placeholder="6-digit PIN code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  maxLength={6}
                  disabled={saving}
                />
              </div>


              {/* COUNTRY */}

              <div className="address-field">
                <label htmlFor="country">
                  COUNTRY
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

            </div>


            {/* DEFAULT */}

            <label className="address-default-checkbox">

              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                disabled={saving}
              />

              <span>
                Set as my default address
              </span>

            </label>


            {/* BUTTONS */}

            <div className="address-form-actions">

              <button
                type="button"
                className="address-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="address-save-button"
                disabled={saving}
              >
                {saving
                  ? "SAVING..."
                  : editingAddress
                    ? "UPDATE ADDRESS"
                    : "SAVE ADDRESS"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================================
          ADDRESS LIST
      ===================================================== */}

      <section className="address-list-section">

        <div className="address-list-header">
          <div>
            <p className="address-card-label">
              SAVED ADDRESSES
            </p>

            <h2>
              Your Addresses
            </h2>
          </div>

          <span className="address-count">
            {addresses.length}
            {" "}
            {addresses.length === 1
              ? "ADDRESS"
              : "ADDRESSES"}
          </span>
        </div>


        {loading ? (
          <div className="address-empty">
            <MapPin size={30} />
            <p>Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="address-empty">

            <MapPin size={34} />

            <h3>
              No addresses yet
            </h3>

            <p>
              Add your first delivery address
              to make checkout faster.
            </p>

            <button
              type="button"
              className="address-primary-button"
              onClick={handleAddAddress}
            >
              <Plus size={17} />
              ADD ADDRESS
            </button>

          </div>
        ) : (
          <div className="address-grid">

            {addresses.map((address) => (
              <article
                className={`address-card ${
                  address.isDefault
                    ? "address-card-default"
                    : ""
                }`}
                key={address.id}
              >

                <div className="address-card-top">

                  <div className="address-card-location">
                    <MapPin size={19} />

                    <div>
                      <h3>
                        {address.fullName}
                      </h3>

                      {address.isDefault && (
                        <span className="address-default-badge">
                          <Star size={12} />
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </div>

                </div>


                <div className="address-card-details">

                  <p>
                    {address.addressLine1}
                  </p>

                  {address.addressLine2 && (
                    <p>
                      {address.addressLine2}
                    </p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state}{" "}
                    {address.postalCode}
                  </p>

                  <p>
                    {address.country}
                  </p>

                  <p className="address-card-phone">
                    {address.phone}
                  </p>

                </div>


                <div className="address-card-actions">

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetDefault(address.id)
                      }
                      className="address-action-button"
                    >
                      <Star size={15} />
                      SET DEFAULT
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleEditAddress(address)
                    }
                    className="address-action-button"
                  >
                    <Pencil size={15} />
                    EDIT
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(address.id)
                    }
                    className="address-action-button address-delete-button"
                  >
                    <Trash2 size={15} />
                    DELETE
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>


      {/* =====================================================
          BACK TO ACCOUNT
      ===================================================== */}

      <Link
        to="/account"
        className="address-back-link"
      >
        <ArrowLeft size={16} />
        BACK TO MY ACCOUNT
      </Link>

    </main>
  );
}

export default Address;