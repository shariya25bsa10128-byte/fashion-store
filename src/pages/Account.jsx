import "./Account.css";

import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";



function Account() {

  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
    logout,
    loading,
  } = useAuth();


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <main className="account-page">

        <section className="account-login-required">

          <div className="account-login-icon">
            <User size={34} />
          </div>

          <p className="account-eyebrow">
            FASHIONSTORE ACCOUNT
          </p>

          <h1>
            Loading...
          </h1>

          <p>
            Please wait while we load your
            account information.
          </p>

        </section>

      </main>
    );
  }


  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!isLoggedIn || !user) {

    return (
      <main className="account-page">

        <section className="account-login-required">

          <div className="account-login-icon">
            <User size={34} />
          </div>

          <p className="account-eyebrow">
            FASHIONSTORE ACCOUNT
          </p>

          <h1>
            Welcome to
            <br />
            FASHIONSTORE
          </h1>

          <p>
            Sign in to access your account,
            orders, wishlist, and personal
            information.
          </p>

          <div className="account-login-actions">

            <Link
              to="/login"
              className="account-primary-button"
            >
              SIGN IN
            </Link>

            <Link
              to="/signup"
              className="account-secondary-button"
            >
              CREATE ACCOUNT
            </Link>

          </div>

        </section>

      </main>
    );
  }


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {

    logout();

    navigate("/login");
  };


  /* =========================================================
     USER INFORMATION
  ========================================================= */

  const displayName =
    user.name?.trim() ||
    user.username?.trim() ||
    "FASHIONSTORE CUSTOMER";


  const displayUsername =
    user.username?.trim() ||
    "Not provided";


  const displayEmail =
    user.email?.trim() ||
    "Not provided";


  const displayPhone =
    user.phone?.trim() ||
    "Not provided";


  /* =========================================================
     ACCOUNT DASHBOARD
  ========================================================= */

  return (

    <main className="account-page">


      {/* =====================================================
          ACCOUNT HEADER
      ===================================================== */}

      <section className="account-header">

        <div>

          <p className="account-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            Hello, {displayName}
          </h1>

          <p>
            Manage your profile, orders,
            wishlist, and shopping preferences.
          </p>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          className="account-logout-button"
          onClick={handleLogout}
        >

          <LogOut size={17} />

          LOG OUT

        </button>

      </section>


      {/* =====================================================
          ACCOUNT CONTENT
      ===================================================== */}

      <section className="account-content">


        {/* ===================================================
            PROFILE
        =================================================== */}

        <div className="account-profile-card">


          {/* PROFILE HEADER */}

          <div className="account-card-header">

            <div className="account-card-header-left">

              <div className="account-card-icon">
                <User size={20} />
              </div>

              <div>

                <p className="account-card-label">
                  PERSONAL INFORMATION
                </p>

                <h2>
                  My Profile
                </h2>

              </div>

            </div>


            {/* EDIT PROFILE */}

            <Link
              to="/edit-profile"
              className="account-edit-button"
            >

              EDIT PROFILE

              <ChevronRight size={16} />

            </Link>

          </div>


          {/* PROFILE DETAILS */}

          <div className="account-profile-details">


            {/* =================================================
                FULL NAME
            ================================================= */}

            <div className="account-detail">

              <span>

                <User size={16} />

                FULL NAME

              </span>

              <strong>
                {displayName}
              </strong>

            </div>


            {/* =================================================
                USERNAME
            ================================================= */}

            <div className="account-detail">

              <span>

                <User size={16} />

                USERNAME

              </span>

              <strong>
                {displayUsername}
              </strong>

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="account-detail">

              <span>

                <Mail size={16} />

                EMAIL ADDRESS

              </span>

              <strong>
                {displayEmail}
              </strong>

            </div>


            {/* =================================================
                PHONE
            ================================================= */}

            <div className="account-detail">

              <span>

                <Phone size={16} />

                PHONE NUMBER

              </span>

              <strong>
                {displayPhone}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            ACCOUNT OPTIONS
        =================================================== */}

        <div className="account-options">


          {/* =================================================
              ORDERS
          ================================================= */}

          <Link
            to="/orders"
            className="account-option"
          >

            <div className="account-option-left">

              <div className="account-option-icon">

                <Package size={21} />

              </div>


              <div>

                <h3>
                  My Orders
                </h3>

                <p>
                  View your orders and
                  track deliveries.
                </p>

              </div>

            </div>


            <ChevronRight size={19} />

          </Link>


          {/* =================================================
              ADDRESSES
          ================================================= */}

          <Link
  to="/address"
  className="account-option"
>

            <div className="account-option-left">

              <div className="account-option-icon">

                <MapPin size={21} />

              </div>


              <div>

                <h3>
                  My Addresses
                </h3>

                <p>
                  Manage your delivery
                  addresses and locations.
                </p>

              </div>

            </div>


            <ChevronRight size={19} />

          </Link>


          {/* =================================================
              WISHLIST
          ================================================= */}

          <Link
            to="/wishlist"
            className="account-option"
          >

            <div className="account-option-left">

              <div className="account-option-icon">

                <Heart size={21} />

              </div>


              <div>

                <h3>
                  My Wishlist
                </h3>

                <p>
                  View products you've
                  saved for later.
                </p>

              </div>

            </div>


            <ChevronRight size={19} />

          </Link>


          {/* =================================================
              CART
          ================================================= */}

          <Link
            to="/cart"
            className="account-option"
          >

            <div className="account-option-left">

              <div className="account-option-icon">

                <ShoppingBag size={21} />

              </div>


              <div>

                <h3>
                  Shopping Bag
                </h3>

                <p>
                  Review your current
                  shopping cart.
                </p>

              </div>

            </div>


            <ChevronRight size={19} />

          </Link>

        </div>


        {/* ===================================================
            ACCOUNT NOTE
        =================================================== */}

        <div className="account-note">

          <p>
            Your account is connected to
            FASHIONSTORE authentication.
            Your profile information is loaded
            from your authenticated account.
          </p>

        </div>

      </section>

    </main>
  );
}


export default Account;