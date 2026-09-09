
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./EditProfile.css";


const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function EditProfile() {
  const navigate = useNavigate();

  const {
    user,
    setUser,
    isLoggedIn,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="edit-profile-page">
        <div className="edit-profile-loading">
          Loading...
        </div>
      </main>
    );
  }

  // =========================================================
  // LOGIN REQUIRED
  // =========================================================

  if (!isLoggedIn || !user) {
    return (
      <main className="edit-profile-page">
        <section className="edit-profile-login">
          <div className="edit-profile-login-icon">
            <User size={32} />
          </div>

          <p>FASHIONSTORE ACCOUNT</p>

          <h1>Please Sign In</h1>

          <span>
            You need to sign in before editing
            your profile.
          </span>

          <Link
            to="/login"
            className="edit-profile-signin"
          >
            SIGN IN
          </Link>
        </section>
      </main>
    );
  }

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = formData.name.trim();
    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim();

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    // =======================================================
    // SAVE TO BACKEND
    // =======================================================

    try {
      setSaving(true);

      const response = await fetch(
  `${API_URL}/auth/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: user.id,
            name: cleanName,
            username: cleanUsername || null,
            email: cleanEmail,
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to update your profile."
        );

        return;
      }

      // =====================================================
      // UPDATED USER
      // =====================================================

      const updatedUser = {
        ...data.user,

        loggedIn: true,

        loginTime:
          user.loginTime ||
          new Date().toISOString(),
      };

      // =====================================================
      // UPDATE AUTH CONTEXT
      // =====================================================

      setUser(updatedUser);

      // =====================================================
      // UPDATE LOCAL STORAGE
      // =====================================================

      localStorage.setItem(
        "fashionstore_user",
        JSON.stringify(updatedUser)
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Profile updated successfully!"
      );

      // =====================================================
      // RETURN TO ACCOUNT
      // =====================================================

      setTimeout(() => {
        navigate("/account");
      }, 1000);

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running on port 5000."
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="edit-profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="edit-profile-header">

        <div>

          <Link
            to="/account"
            className="edit-profile-back"
          >
            <ArrowLeft size={16} />
            BACK TO ACCOUNT
          </Link>

          <p className="edit-profile-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            Edit Profile
          </h1>

          <p>
            Update your personal information below.
          </p>

        </div>

      </section>


      {/* =====================================================
          FORM
      ===================================================== */}

      <section className="edit-profile-content">

        <form
          className="edit-profile-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              NAME
          ================================================= */}

          <div className="edit-profile-field">

            <label htmlFor="edit-name">
              FULL NAME
            </label>

            <input
              id="edit-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              autoComplete="name"
            />

          </div>


          {/* =================================================
              USERNAME
          ================================================= */}

          <div className="edit-profile-field">

            <label htmlFor="edit-username">
              USERNAME
            </label>

            <input
              id="edit-username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={saving}
              autoComplete="username"
            />

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="edit-profile-field">

            <label htmlFor="edit-email">
              EMAIL ADDRESS
            </label>

            <input
              id="edit-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={saving}
              autoComplete="email"
            />

          </div>


          {/* =================================================
              PHONE
          ================================================= */}

          <div className="edit-profile-field">

            <label htmlFor="edit-phone">
              PHONE NUMBER
            </label>

            <input
              id="edit-phone"
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              disabled={saving}
              autoComplete="tel"
            />

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="edit-profile-error">
              {error}
            </div>
          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="edit-profile-success">
              {success}
            </div>
          )}


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="edit-profile-actions">

            <Link
              to="/account"
              className="edit-profile-cancel"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              className="edit-profile-save"
              disabled={saving}
            >

              <Save size={17} />

              {saving
                ? "SAVING..."
                : "SAVE CHANGES"}

            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

export default EditProfile;