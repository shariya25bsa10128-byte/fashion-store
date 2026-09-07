import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  Lock,
  MapPin,
  Check,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "./Checkout.css";

// =========================================================
// API
// =========================================================

const API_URL = "http://localhost:5000";

// =========================================================
// CHECKOUT
// =========================================================

function Checkout() {
  const navigate = useNavigate();

  // =======================================================
  // CONTEXT
  // =======================================================

  const {
    cartItems,
    clearCart,
  } = useCart();

  const {
    user,
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  // =======================================================
  // PAYMENT METHOD
  // =======================================================

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  // =======================================================
  // SAVED ADDRESSES
  // =======================================================

  const [addresses, setAddresses] =
    useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState(null);

  const [loadingAddresses, setLoadingAddresses] =
    useState(false);

  // =======================================================
  // DELIVERY FORM
  // =======================================================

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
    });

  // =======================================================
  // ORDER STATE
  // =======================================================

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  // =======================================================
  // COUPON STATE
  // =======================================================

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponDiscount, setCouponDiscount] =
    useState(0);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [couponSuccess, setCouponSuccess] =
    useState("");

  const [availableCoupons, setAvailableCoupons] =
    useState([]);

  const [couponsLoading, setCouponsLoading] =
    useState(false);

  // =========================================================
  // LOAD USER INFORMATION
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    const fullName =
      user.name?.trim() ||
      user.username?.trim() ||
      "";

    const nameParts =
      fullName
        .split(/\s+/)
        .filter(Boolean);

    const firstName =
      nameParts.shift() || "";

    const lastName =
      nameParts.join(" ") || "";

    setFormData((current) => ({
      ...current,

      firstName:
        current.firstName ||
        firstName,

      lastName:
        current.lastName ||
        lastName,

      email:
        current.email ||
        user.email ||
        "",

      phone:
        current.phone ||
        user.phone ||
        "",
    }));
  }, [user, authLoading]);

  // =========================================================
  // LOAD SAVED ADDRESSES
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      return;
    }

    if (!user?.id) {
      return;
    }

    let cancelled = false;

    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const response =
          await fetch(
            `${API_URL}/api/addresses?userId=${Number(
              user.id
            )}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load addresses."
          );
        }

        if (cancelled) {
          return;
        }

        const savedAddresses =
          Array.isArray(
            data.addresses
          )
            ? data.addresses
            : [];

        setAddresses(
          savedAddresses
        );

        // ===================================================
        // SELECT DEFAULT ADDRESS
        // ===================================================

        if (
          savedAddresses.length > 0
        ) {
          const defaultAddress =
            savedAddresses.find(
              (address) =>
                address.isDefault
            ) ||
            savedAddresses[0];

          handleSelectAddress(
            defaultAddress
          );
        }
      } catch (error) {
        console.error(
          "LOAD CHECKOUT ADDRESSES ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isLoggedIn,
    user?.id,
  ]);

  // =========================================================
  // LOAD ACTIVE COUPONS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadActiveCoupons = async () => {
      try {
        setCouponsLoading(true);

        const response = await fetch(
          `${API_URL}/api/coupons`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to load coupons."
          );
        }

        const coupons = Array.isArray(result.data)
          ? result.data
          : [];

        const currentTime = Date.now();

        const activeCoupons = coupons.filter(
          (coupon) => {
            if (!coupon.isActive) {
              return false;
            }

            if (coupon.expiresAt) {
              const expiryTime = new Date(
                coupon.expiresAt
              ).getTime();

              if (
                !Number.isFinite(expiryTime) ||
                expiryTime <= currentTime
              ) {
                return false;
              }
            }

            if (
              coupon.usageLimit !== null &&
              coupon.usageLimit !== undefined &&
              Number(coupon.usedCount || 0) >=
                Number(coupon.usageLimit)
            ) {
              return false;
            }

            return true;
          }
        );

        if (!cancelled) {
          setAvailableCoupons(activeCoupons);
        }
      } catch (error) {
        console.error(
          "LOAD ACTIVE COUPONS ERROR:",
          error
        );

        if (!cancelled) {
          setAvailableCoupons([]);
        }
      } finally {
        if (!cancelled) {
          setCouponsLoading(false);
        }
      }
    };

    loadActiveCoupons();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // SELECT SAVED ADDRESS
  // =========================================================

  const handleSelectAddress = (
    address
  ) => {
    if (!address) {
      return;
    }

    setSelectedAddressId(
      address.id
    );

    const fullName =
      address.fullName?.trim() ||
      "";

    const nameParts =
      fullName
        .split(/\s+/)
        .filter(Boolean);

    const firstName =
      nameParts.shift() || "";

    const lastName =
      nameParts.join(" ") || "";

    setFormData((current) => ({
      ...current,

      firstName:
        firstName ||
        current.firstName,

      lastName:
        lastName ||
        current.lastName,

      phone:
        address.phone ||
        current.phone,

      address:
        address.addressLine1 ||
        "",

      apartment:
        address.addressLine2 ||
        "",

      city:
        address.city ||
        "",

      state:
        address.state ||
        "",

      pincode:
        address.postalCode ||
        "",
    }));

    setError("");
  };

  // =========================================================
  // TOTALS
  // =========================================================

  const subtotal =
    Array.isArray(cartItems)
      ? cartItems.reduce(
          (sum, item) => {
            const price =
              Number(item.price) || 0;

            const quantity =
              Number(item.quantity) || 1;

            return (
              sum +
              price * quantity
            );
          },
          0
        )
      : 0;

  const shipping =
    subtotal >= 999
      ? 0
      : 99;

  // =========================================================
  // FINAL TOTAL
  // =========================================================

  const totalBeforeDiscount =
    subtotal + shipping;

  const total = Math.max(
    0,
    totalBeforeDiscount -
      couponDiscount
  );

  // =========================================================
  // APPLY COUPON
  // =========================================================

  const handleApplyCoupon = async () => {
    const code =
      couponCode
        .trim()
        .toUpperCase();

    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError(
        "Please enter a coupon code."
      );
      return;
    }

    if (!subtotal) {
      setCouponError(
        "Your cart is empty."
      );
      return;
    }

    try {
      setCouponLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/coupons/validate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              code,
              userId:
                Number(user?.id) || null,
              subtotal:
                Number(subtotal),
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
            "Invalid coupon code."
        );
      }

      // =====================================================
      // BACKEND RESPONSE
      // =====================================================

      const coupon =
        result.coupon ||
        result.data?.coupon ||
        result.data ||
        null;

      let discount = Number(
        result.discount ??
          result.data?.discount ??
          0
      );

      // =====================================================
      // FALLBACK DISCOUNT CALCULATION
      // =====================================================

      if (
        coupon &&
        discount <= 0
      ) {
        if (
          coupon.discountType ===
          "PERCENTAGE"
        ) {
          discount =
            (subtotal *
              Number(
                coupon.discountValue ||
                  0
              )) /
            100;

          if (
            coupon.maximumDiscount !==
              null &&
            coupon.maximumDiscount !==
              undefined
          ) {
            discount =
              Math.min(
                discount,
                Number(
                  coupon.maximumDiscount
                )
              );
          }
        } else {
          discount =
            Number(
              coupon.discountValue ||
                0
            );
        }
      }

      // =====================================================
      // SAFETY
      // =====================================================

      discount = Math.max(
        0,
        Math.min(
          Math.round(discount),
          subtotal
        )
      );

      if (
        !coupon &&
        discount <= 0
      ) {
        throw new Error(
          "Coupon could not be applied."
        );
      }

      setAppliedCoupon(
        coupon || {
          code,
          discountType:
            result.discountType ||
            result.data?.discountType ||
            "PERCENTAGE",
          discountValue:
            result.discountValue ||
            result.data?.discountValue ||
            discount,
        }
      );

      setCouponDiscount(
        discount
      );

      setCouponCode(code);

      setCouponSuccess(
        `Coupon ${code} applied successfully.`
      );

      setError("");
    } catch (error) {
      console.error(
        "APPLY COUPON ERROR:",
        error
      );

      setAppliedCoupon(null);
      setCouponDiscount(0);

      setCouponError(
        error instanceof Error
          ? error.message
          : "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // =========================================================
  // REMOVE COUPON
  // =========================================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    const firstName =
      formData.firstName.trim();

    const lastName =
      formData.lastName.trim();

    const email =
      formData.email.trim();

    const phone =
      formData.phone.replace(
        /\D/g,
        ""
      );

    const address =
      formData.address.trim();

    const city =
      formData.city.trim();

    const state =
      formData.state.trim();

    const pincode =
      formData.pincode.trim();

    // =====================================================
    // FIRST NAME
    // =====================================================

    if (!firstName) {
      setError(
        "Please enter your first name."
      );

      return false;
    }

    // =====================================================
    // LAST NAME
    // =====================================================

    if (!lastName) {
      setError(
        "Please enter your last name."
      );

      return false;
    }

    // =====================================================
    // EMAIL
    // =====================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return false;
    }

    // =====================================================
    // PHONE
    // =====================================================

    if (
      phone.length !== 10
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return false;
    }

    // =====================================================
    // ADDRESS
    // =====================================================

    if (!address) {
      setError(
        "Please enter your delivery address."
      );

      return false;
    }

    // =====================================================
    // CITY
    // =====================================================

    if (!city) {
      setError(
        "Please enter your city."
      );

      return false;
    }

    // =====================================================
    // STATE
    // =====================================================

    if (!state) {
      setError(
        "Please enter your state."
      );

      return false;
    }

    // =====================================================
    // PINCODE
    // =====================================================

    if (
      !/^[0-9]{6}$/.test(
        pincode
      )
    ) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async (
    event
  ) => {
    event.preventDefault();

    // =====================================================
    // PREVENT DOUBLE CLICK
    // =====================================================

    if (placingOrder) {
      return;
    }

    setError("");

    // =====================================================
    // AUTH
    // =====================================================

    if (authLoading) {
      setError(
        "Please wait while we verify your account."
      );

      return;
    }

    if (
      !isLoggedIn ||
      !user?.id
    ) {
      setError(
        "Your session has expired. Please sign in again."
      );

      return;
    }

    // =====================================================
    // CART
    // =====================================================

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    // =====================================================
    // FORM
    // =====================================================

    if (!validateForm()) {
      return;
    }

    try {
      setPlacingOrder(true);

      // ===================================================
      // USER ID
      // ===================================================

      const userId =
        Number(user.id);

      if (
        !userId ||
        Number.isNaN(userId)
      ) {
        throw new Error(
          "Unable to identify your account. Please sign in again."
        );
      }

      // ===================================================
      // PREPARE ITEMS
      // ===================================================

      const items =
        cartItems.map(
          (item) => ({
            productId:
              Number(item.id),

            productName:
              item.name ||
              "Product",

            productImage:
              item.image ||
              "",

            size:
              item.selectedSize ||
              item.size ||
              null,

            color:
              item.selectedColor ||
              item.color ||
              null,

            price:
              Number(item.price) ||
              0,

            quantity:
              Number(
                item.quantity || 1
              ),
          })
        );

      // ===================================================
      // VALIDATE PRODUCT IDS
      // ===================================================

      const invalidItem =
        items.find(
          (item) =>
            !item.productId ||
            Number.isNaN(
              item.productId
            )
        );

      if (invalidItem) {
        throw new Error(
          "One of the products in your cart has an invalid product ID. Please remove it and add the product again."
        );
      }

      // ===================================================
      // CUSTOMER
      // ===================================================

      const customerName =
        `${formData.firstName.trim()} ${formData.lastName.trim()}`
          .trim();

      const customerEmail =
        formData.email.trim();

      const customerPhone =
        formData.phone.replace(
          /\D/g,
          ""
        );

      // ===================================================
      // ORDER PAYLOAD
      // ===================================================

      const payload = {
        // -------------------------------------------------
        // USER
        // -------------------------------------------------

        userId,

        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        customerName,

        customerEmail,

        customerPhone,

        // -------------------------------------------------
        // ADDRESS
        // -------------------------------------------------

        shippingAddress1:
          formData.address.trim(),

        shippingAddress2:
          formData.apartment.trim() ||
          null,

        shippingCity:
          formData.city.trim(),

        shippingState:
          formData.state.trim(),

        shippingPostalCode:
          formData.pincode.trim(),

        shippingCountry:
          "India",

        // -------------------------------------------------
        // TOTALS
        // -------------------------------------------------

        subtotal:
          Math.round(subtotal),

        discount:
          Math.round(
            couponDiscount
          ),

        shippingFee:
          Math.round(shipping),

        total:
          Math.round(total),

        // -------------------------------------------------
        // COUPON
        // -------------------------------------------------

        couponCode:
          appliedCoupon?.code ||
          null,

        // -------------------------------------------------
        // PAYMENT
        // -------------------------------------------------

        paymentMethod,

        paymentStatus:
          "PENDING",

        orderStatus:
          "PLACED",

        // -------------------------------------------------
        // ITEMS
        // -------------------------------------------------

        items,
      };

      console.log(
        "CREATING ORDER FOR USER:",
        userId
      );

      console.log(
        "ORDER PAYLOAD:",
        payload
      );

      // ===================================================
      // CREATE ORDER
      // ===================================================

      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      // ===================================================
      // READ RESPONSE
      // ===================================================

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          success: false,
          message:
            "Server returned an invalid response.",
        };
      }

      console.log(
        "ORDER API RESPONSE:",
        data
      );

      // ===================================================
      // CHECK RESPONSE
      // ===================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            `Unable to place your order (${response.status})`
        );
      }

      // ===================================================
      // CREATED ORDER
      // ===================================================

      const createdOrder =
        data.order ||
        data.data ||
        data;

      if (!createdOrder) {
        throw new Error(
          "Order was created but no order information was returned."
        );
      }

      // ===================================================
      // SAVE LAST ORDER
      // ===================================================

      localStorage.setItem(
        "fashionStoreOrder",
        JSON.stringify(
          createdOrder
        )
      );

      localStorage.setItem(
        "lastFashionStoreOrder",
        JSON.stringify(
          createdOrder
        )
      );

      // ===================================================
      // CLEAR CART
      // ===================================================

      clearCart();

      // ===================================================
      // SUCCESS
      // ===================================================

      navigate(
        "/order-success",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    Array.isArray(cartItems) &&
    cartItems.length === 0
  ) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <h1>
            Your Bag Is Empty
          </h1>

          <p>
            Add some products before
            proceeding to checkout.
          </p>

          <Link
            to="/"
            className="checkout-back-btn"
          >
            <ArrowLeft size={15} />

            CONTINUE SHOPPING
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (authLoading) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <Lock size={36} />

          <h1>
            Verifying Your Account...
          </h1>

          <p>
            Please wait while we restore
            your sign-in session.
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (
    !isLoggedIn ||
    !user?.id
  ) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <Lock size={36} />

          <h1>
            Sign In Required
          </h1>

          <p>
            Please sign in before
            proceeding to checkout.
          </p>

          <Link
            to="/login"
            state={{
              from: "/checkout",
            }}
            className="checkout-back-btn"
          >
            SIGN IN
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="checkout-header">

          <Link
            to="/cart"
            className="checkout-back"
          >
            <ArrowLeft size={15} />

            BACK TO BAG
          </Link>

          <h1>
            Checkout
          </h1>

          <div className="secure-checkout">

            <Lock size={13} />

            SECURE CHECKOUT

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="checkout-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =================================================
            CHECKOUT FORM
        ================================================= */}

        <form
          className="checkout-layout"
          onSubmit={
            handlePlaceOrder
          }
        >

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="checkout-main">

            {/* =================================================
                SAVED ADDRESSES
            ================================================= */}

            {addresses.length > 0 && (

              <section className="checkout-section">

                <div className="checkout-section-heading">

                  <span>
                    <MapPin size={18} />
                  </span>

                  <div>

                    <p>
                      SAVED ADDRESSES
                    </p>

                    <h2>
                      Select Delivery Address
                    </h2>

                  </div>

                </div>

                {loadingAddresses ? (

                  <div className="checkout-address-loading">
                    Loading saved addresses...
                  </div>

                ) : (

                  <div className="checkout-address-list">

                    {addresses.map(
                      (address) => (

                        <button
                          type="button"
                          key={address.id}
                          className={
                            selectedAddressId ===
                            address.id
                              ? "checkout-address-option active"
                              : "checkout-address-option"
                          }
                          onClick={() =>
                            handleSelectAddress(
                              address
                            )
                          }
                          disabled={
                            placingOrder
                          }
                        >

                          <div className="checkout-address-radio">

                            {selectedAddressId ===
                              address.id && (
                              <Check
                                size={13}
                              />
                            )}

                          </div>

                          <div className="checkout-address-content">

                            <div className="checkout-address-name">

                              <strong>
                                {
                                  address.fullName
                                }
                              </strong>

                              {address.isDefault && (
                                <span>
                                  DEFAULT
                                </span>
                              )}

                            </div>

                            <p>
                              {
                                address.addressLine1
                              }
                            </p>

                            {address.addressLine2 && (
                              <p>
                                {
                                  address.addressLine2
                                }
                              </p>
                            )}

                            <p>
                              {
                                address.city
                              }
                              ,{" "}
                              {
                                address.state
                              }{" "}
                              {
                                address.postalCode
                              }
                            </p>

                            <p>
                              {
                                address.phone
                              }
                            </p>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </section>

            )}

            {/* =================================================
                DELIVERY
            ================================================= */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  01
                </span>

                <div>

                  <p>
                    DELIVERY
                  </p>

                  <h2>
                    Delivery Information
                  </h2>

                </div>

              </div>

              {/* NAME */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    FIRST NAME *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="First name"
                    disabled={
                      placingOrder
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    LAST NAME *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Last name"
                    disabled={
                      placingOrder
                    }
                  />

                </div>

              </div>

              {/* CONTACT */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    EMAIL *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    disabled={
                      placingOrder
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    PHONE *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled={
                      placingOrder
                    }
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-group">

                <label>
                  ADDRESS *
                </label>

                <input
                  type="text"
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="House number and street name"
                  disabled={
                    placingOrder
                  }
                />

              </div>

              {/* APARTMENT */}

              <div className="form-group">

                <label>
                  APARTMENT / LANDMARK
                </label>

                <input
                  type="text"
                  name="apartment"
                  value={
                    formData.apartment
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Apartment, suite, landmark (optional)"
                  disabled={
                    placingOrder
                  }
                />

              </div>

              {/* LOCATION */}

              <div className="form-row three-columns">

                <div className="form-group">

                  <label>
                    CITY *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="City"
                    disabled={
                      placingOrder
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    STATE *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="State"
                    disabled={
                      placingOrder
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    PINCODE *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={
                      formData.pincode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="000000"
                    maxLength={6}
                    disabled={
                      placingOrder
                    }
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  02
                </span>

                <div>

                  <p>
                    PAYMENT
                  </p>

                  <h2>
                    Payment Method
                  </h2>

                </div>

              </div>

              <div className="payment-options">

                {/* CARD */}

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "card"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "card"
                    )
                  }
                  disabled={
                    placingOrder
                  }
                >

                  <CreditCard
                    size={20}
                  />

                  <div>

                    <strong>
                      Credit / Debit Card
                    </strong>

                    <span>
                      Visa, Mastercard, RuPay
                    </span>

                  </div>

                  <span className="payment-radio">

                    {paymentMethod ===
                    "card"
                      ? "●"
                      : "○"}

                  </span>

                </button>

                {/* UPI */}

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "upi"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "upi"
                    )
                  }
                  disabled={
                    placingOrder
                  }
                >

                  <Smartphone
                    size={20}
                  />

                  <div>

                    <strong>
                      UPI
                    </strong>

                    <span>
                      Google Pay, PhonePe, Paytm
                    </span>

                  </div>

                  <span className="payment-radio">

                    {paymentMethod ===
                    "upi"
                      ? "●"
                      : "○"}

                  </span>

                </button>

                {/* COD */}

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "cod"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "cod"
                    )
                  }
                  disabled={
                    placingOrder
                  }
                >

                  <Banknote
                    size={20}
                  />

                  <div>

                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>

                  </div>

                  <span className="payment-radio">

                    {paymentMethod ===
                    "cod"
                      ? "●"
                      : "○"}

                  </span>

                </button>

              </div>

              {/* CARD DETAILS */}

              {paymentMethod ===
                "card" && (

                <div className="payment-details">

                  <div className="form-group">

                    <label>
                      CARD NUMBER
                    </label>

                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      disabled={
                        placingOrder
                      }
                    />

                  </div>

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        EXPIRY DATE
                      </label>

                      <input
                        type="text"
                        placeholder="MM / YY"
                        disabled={
                          placingOrder
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        CVV
                      </label>

                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        disabled={
                          placingOrder
                        }
                      />

                    </div>

                  </div>

                </div>

              )}

              {/* UPI DETAILS */}

              {paymentMethod ===
                "upi" && (

                <div className="payment-details">

                  <div className="form-group">

                    <label>
                      UPI ID
                    </label>

                    <input
                      type="text"
                      placeholder="yourname@upi"
                      disabled={
                        placingOrder
                      }
                    />

                  </div>

                </div>

              )}

            </section>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="checkout-summary">

            <h2>
              Your Order
            </h2>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="checkout-products">

              {cartItems.map(
                (item) => (

                  <div
                    className="checkout-product"
                    key={`${item.id}-${item.selectedSize || item.size || "default"}-${item.selectedColor || item.color || "default"}`}
                  >

                    <div className="checkout-product-image">

                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <span>
                        {item.quantity}
                      </span>

                    </div>

                    <div className="checkout-product-info">

                      <strong>
                        {item.name}
                      </strong>

                      {(item.selectedSize ||
                        item.size) && (

                        <span>
                          Size:{" "}
                          {item.selectedSize ||
                            item.size}
                        </span>

                      )}

                      {(item.selectedColor ||
                        item.color) && (

                        <span>
                          Color:{" "}
                          {item.selectedColor ||
                            item.color}
                        </span>

                      )}

                    </div>

                    <strong>

                      ₹
                      {(
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity ||
                            1
                        )
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </strong>

                  </div>

                )
              )}

            </div>

            {/* =================================================
                COUPON
            ================================================= */}

            <div className="checkout-coupon-section">

              <div className="checkout-coupon-heading">

                <span>
                  DISCOUNT CODE
                </span>

                <strong>
                  Have a coupon?
                </strong>

              </div>

              {!appliedCoupon && (
                <div className="checkout-available-coupons">
                  <div className="checkout-available-coupons-header">
                    <span>AVAILABLE OFFERS</span>

                    {!couponsLoading &&
                      availableCoupons.length > 0 && (
                        <small>
                          {availableCoupons.length}{" "}
                          {availableCoupons.length === 1
                            ? "offer"
                            : "offers"}{" "}
                          available
                        </small>
                      )}
                  </div>

                  {couponsLoading ? (
                    <div className="checkout-coupons-loading">
                      Loading available offers...
                    </div>
                  ) : availableCoupons.length > 0 ? (
                    <div className="checkout-coupon-list">
                      {availableCoupons.map((coupon) => {
                        const discountType = String(
                          coupon.discountType || ""
                        ).toUpperCase();

                        const discountValue = Number(
                          coupon.discountValue || 0
                        );

                        const discountText =
                          discountType === "PERCENTAGE"
                            ? `${discountValue}% OFF`
                            : `₹${discountValue.toLocaleString("en-IN")} OFF`;

                        const minimumAmount = Number(
                          coupon.minimumAmount || 0
                        );

                        return (
                          <div
                            className="checkout-coupon-card"
                            key={coupon.id}
                          >
                            <div className="checkout-coupon-card-left">
                              <div className="checkout-coupon-icon">
                                %
                              </div>

                              <div className="checkout-coupon-card-info">
                                <div className="checkout-coupon-code">
                                  {coupon.code}
                                </div>

                                <strong>
                                  {discountText}
                                </strong>

                                <span>
                                  {minimumAmount > 0
                                    ? `On orders above ₹${minimumAmount.toLocaleString("en-IN")}`
                                    : "Available on all orders"}
                                </span>

                                {coupon.maximumDiscount !== null &&
                                  coupon.maximumDiscount !== undefined && (
                                    <small>
                                      Max discount ₹
                                      {Number(
                                        coupon.maximumDiscount
                                      ).toLocaleString("en-IN")}
                                    </small>
                                  )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="checkout-use-coupon"
                              onClick={() => {
                                setCouponCode(
                                  String(
                                    coupon.code
                                  ).toUpperCase()
                                );
                                setCouponError("");
                                setCouponSuccess("");
                              }}
                              disabled={placingOrder}
                            >
                              USE CODE
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="checkout-no-coupons">
                      No active coupons available right now.
                    </div>
                  )}
                </div>
              )}

              {!appliedCoupon ? (

                <div className="checkout-coupon-form">

                  <input
                    type="text"
                    value={
                      couponCode
                    }
                    onChange={(
                      event
                    ) => {

                      setCouponCode(
                        event.target.value.toUpperCase()
                      );

                      setCouponError(
                        ""
                      );

                      setCouponSuccess(
                        ""
                      );

                    }}
                    onKeyDown={(
                      event
                    ) => {

                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        handleApplyCoupon();
                      }

                    }}
                    placeholder="ENTER CODE"
                    maxLength={50}
                    autoComplete="off"
                    disabled={
                      placingOrder ||
                      couponLoading
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={
                      placingOrder ||
                      couponLoading
                    }
                  >

                    {couponLoading
                      ? "..."
                      : "APPLY"}

                  </button>

                </div>

              ) : (

                <div className="checkout-applied-coupon">

                  <div className="checkout-applied-coupon-info">

                    <div className="checkout-coupon-check">

                      <Check
                        size={13}
                      />

                    </div>

                    <div>

                      <strong>
                        {
                          appliedCoupon.code
                        }
                      </strong>

                      <span>
                        Coupon applied
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                    disabled={
                      placingOrder
                    }
                  >
                    REMOVE
                  </button>

                </div>

              )}

              {couponError && (

                <p className="checkout-coupon-error">
                  {couponError}
                </p>

              )}

              {couponSuccess && (

                <p className="checkout-coupon-success">
                  {couponSuccess}
                </p>

              )}

            </div>

            {/* =================================================
                TOTALS
            ================================================= */}

            <div className="checkout-summary-lines">

              {/* SUBTOTAL */}

              <div>

                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              {/* SHIPPING */}

              <div>

                <span>
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping}`}
                </span>

              </div>

              {/* DISCOUNT */}

              {couponDiscount > 0 && (

                <div className="checkout-discount-row">

                  <span>
                    Discount
                    {appliedCoupon?.code
                      ? ` (${appliedCoupon.code})`
                      : ""}
                  </span>

                  <span>
                    -₹
                    {couponDiscount.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              )}

            </div>

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="checkout-total">

              <span>
                TOTAL
              </span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* =================================================
                PLACE ORDER
            ================================================= */}

            <button
              type="submit"
              className="place-order-btn"
              disabled={
                placingOrder
              }
            >

              {placingOrder
                ? "PLACING ORDER..."
                : "PLACE ORDER"}

            </button>

            {/* =================================================
                SECURITY
            ================================================= */}

            <p className="checkout-security">

              <Lock size={13} />

              Your information is protected
              with secure encryption.

            </p>

          </aside>

        </form>

      </div>

    </main>
  );
}

export default Checkout;