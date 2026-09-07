import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();

  /* =========================================================
     AUTH CONTEXT
  ========================================================= */

  const { login } = useAuth();


  /* =========================================================
     STATE
  ========================================================= */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);


  /* =========================================================
     HANDLE LOGIN
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /* =======================================================
       CLEAN INPUT
    ======================================================= */

    const cleanEmail =
      email.trim().toLowerCase();


    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }


    if (!cleanEmail.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }


    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }


    /* =======================================================
       LOGIN
       
       Authentication is handled by AuthContext.
       
       AuthContext will:
       
       1. Call backend
       2. Create logged-in user
       3. Save user to localStorage
       4. Update global AuthContext state
       
    ======================================================= */

    try {
      setLoading(true);

      const result =
        await login(
          cleanEmail,
          password
        );


      /* =====================================================
         LOGIN FAILED
      ===================================================== */

      if (!result?.success) {
        setError(
          result?.message ||
            "Invalid email or password."
        );

        return;
      }


      /* =====================================================
         LOGIN SUCCESSFUL
      ===================================================== */

      console.log(
        "LOGIN SUCCESS:",
        result.user
      );


      /* =====================================================
         GO TO HOME
      ===================================================== */

      navigate("/");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        "Something went wrong while signing in. Please try again."
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
            everyday style. Sign in to access your
            wishlist, orders, and personalized
            shopping experience.
          </p>

        </div>

      </section>


      {/* =====================================================
          RIGHT LOGIN SECTION
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
              Welcome Back
            </h2>


            <p>
              Sign in to your FASHIONSTORE account
              to continue shopping.
            </p>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* ===============================================
                EMAIL
            =============================================== */}

            <div className="form-field">

              <label htmlFor="login-email">
                EMAIL ADDRESS
              </label>


              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

                  setError("");
                }}
                autoComplete="email"
                disabled={loading}
              />

            </div>


            {/* ===============================================
                PASSWORD
            =============================================== */}

            <div className="form-field">

              <div className="password-label-row">

                <label htmlFor="login-password">
                  PASSWORD
                </label>


                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    alert(
                      "Password reset will be added later."
                    );
                  }}
                  disabled={loading}
                >
                  FORGOT PASSWORD?
                </button>

              </div>


              <div className="password-input-wrapper">

                <input
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    setError("");
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
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


            {/* ===============================================
                ERROR MESSAGE
            =============================================== */}

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}


            {/* ===============================================
                SUBMIT BUTTON
            =============================================== */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? "SIGNING IN..."
                  : "SIGN IN"}
              </span>


              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          {/* =================================================
              CREATE ACCOUNT
          ================================================= */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>


            <Link to="/signup">
              CREATE ACCOUNT
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

export default Login;