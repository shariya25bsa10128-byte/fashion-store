import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  /* =========================================================
     HANDLE SIGNUP
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();


    /* =======================================================
       BASIC VALIDATION
    ======================================================= */

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }


    /* =======================================================
       NAME VALIDATION
    ======================================================= */

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }


    /* =======================================================
       EMAIL VALIDATION
    ======================================================= */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }


    /* =======================================================
       PHONE VALIDATION
    ======================================================= */

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }


    /* =======================================================
       PASSWORD VALIDATION
    ======================================================= */

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    /* =======================================================
       CREATE ACCOUNT
    ======================================================= */

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            password,
          }),
        }
      );


      /* =====================================================
         SAFELY READ RESPONSE
      ===================================================== */

      let data;

      try {
        data = await response.json();
      } catch {
        setError(
          "The server returned an invalid response. Please try again."
        );
        return;
      }

      console.log("SIGNUP RESPONSE:", data);


      /* =====================================================
         BACKEND ERROR
      ===================================================== */

      if (!response.ok || data?.success !== true) {
        setError(
          data?.message ||
            "Unable to create your account."
        );
        return;
      }


      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );


      /* =====================================================
         CLEAR FORM
      ===================================================== */

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });


      /* =====================================================
         REDIRECT
      ===================================================== */

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "SIGNUP NETWORK ERROR:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running on port 5000."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="auth-page">

      {/* =====================================================
          LEFT BRAND SECTION
      ===================================================== */}

      <section className="auth-brand">

        <div className="auth-brand-content">

          <p className="auth-eyebrow">
            FASHIONSTORE
          </p>

          <h1>
            STYLE
            <br />
            STARTS
            <br />
            HERE.
          </h1>

          <p className="auth-brand-text">
            Discover pieces designed for your
            everyday style. Create an account to
            access your wishlist, orders, and
            personalized shopping experience.
          </p>

        </div>

      </section>


      {/* =====================================================
          RIGHT SIGNUP SECTION
      ===================================================== */}

      <section className="auth-form-section">

        <div className="auth-form-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="auth-header">

            <p className="auth-label">
              ACCOUNT
            </p>

            <h2>
              Create Account
            </h2>

            <p>
              Create your FASHIONSTORE account
              to start shopping with us.
            </p>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div
              className="auth-success"
              role="status"
            >
              {success}
            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                FULL NAME
            ================================================= */}

            <div className="form-field">

              <label htmlFor="signup-name">
                FULL NAME
              </label>

              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
              />

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="form-field">

              <label htmlFor="signup-email">
                EMAIL ADDRESS
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />

            </div>


            {/* =================================================
                PHONE
            ================================================= */}

            <div className="form-field">

              <label htmlFor="signup-phone">
                PHONE NUMBER
              </label>

              <input
                id="signup-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(event) => {

                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setFormData((previous) => ({
                    ...previous,
                    phone: value,
                  }));

                  setError("");
                  setSuccess("");
                }}
                maxLength={10}
                autoComplete="tel"
                disabled={loading}
              />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="form-field">

              <label htmlFor="signup-password">
                PASSWORD
              </label>

              <div className="password-input-wrapper">

                <input
                  id="signup-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className="form-field">

              <label htmlFor="signup-confirm-password">
                CONFIRM PASSWORD
              </label>

              <div className="password-input-wrapper">

                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                SUBMIT BUTTON
            ================================================= */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
              </span>

              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          {/* =================================================
              LOGIN
          ================================================= */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              SIGN IN
            </Link>

          </div>


          {/* =================================================
              BACK TO SHOPPING
          ================================================= */}

          <Link
            to="/"
            className="auth-back-link"
          >
            ← CONTINUE SHOPPING
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Signup;