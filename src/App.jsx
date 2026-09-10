import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import EditProfile from "./pages/EditProfile";
import Address from "./pages/Address";
import OrderDetails from "./pages/OrderDetails";

import AdminCustomerDetails from "./admin/pages/AdminCustomerDetails";

// =========================================================
// ADMIN PAGES
// =========================================================

import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminOrderDetails from "./admin/pages/AdminOrderDetails";
import AdminCoupons from "./admin/pages/AdminCoupons";

// =========================================================
// DATA
// =========================================================

import products from "./data/products";

import "./App.css";

// =========================================================
// HOMEPAGE CATEGORIES
// =========================================================

const categories = [
  {
    title: "MEN",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=85",
  },

  {
    title: "WOMEN",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },

  {
    title: "KIDS",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=85",
  },
];

// =========================================================
// HOME PAGE
// =========================================================

function Home() {
  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">

        <div className="hero-content">

          <p className="hero-subtitle">
            NEW SEASON 2026
          </p>

          <h1>
            STYLE THAT
            <br />
            SPEAKS FOR YOU.
          </h1>

          <p className="hero-description">
            Discover the latest trends, timeless
            essentials, and pieces made to elevate
            your everyday style.
          </p>

          <div className="hero-buttons">

            <Link
              to="/men"
              className="primary-btn"
            >
              SHOP MEN
            </Link>

            <Link
              to="/women"
              className="secondary-btn"
            >
              SHOP WOMEN
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <section className="categories-section">

        <div className="section-heading">

          <p>
            EXPLORE
          </p>

          <h2>
            Shop By Category
          </h2>

        </div>

        <div className="categories-grid">

          {categories.map((category) => (

            <div
              className="category-card"
              key={category.title}
            >

              <img
                src={category.image}
                alt={category.title}
              />

              <div className="category-overlay">

                <h3>
                  {category.title}
                </h3>

                <Link
                  to={`/${category.title.toLowerCase()}`}
                >
                  SHOP NOW →
                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section className="products-section">

        <div className="section-heading">

          <p>
            OUR COLLECTION
          </p>

          <h2>
            Featured Products
          </h2>

        </div>

        <div className="products-grid">

          {products
            .slice(0, 4)
            .map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}

        </div>

      </section>

    </main>
  );
}

// =========================================================
// 404 PAGE
// =========================================================

function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
      }}
    >

      <p
        style={{
          fontSize: "12px",
          letterSpacing: "3px",
          fontWeight: "700",
          marginBottom: "15px",
        }}
      >
        404
      </p>

      <h1
        style={{
          fontSize: "42px",
          marginBottom: "15px",
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "25px",
        }}
      >
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="primary-btn"
      >
        BACK TO HOME
      </Link>

    </main>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>

      {/* =====================================================
          CUSTOMER NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          APPLICATION ROUTES
      ===================================================== */}

      <Routes>

        {/* ===================================================
            CUSTOMER — HOME
        =================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ===================================================
            CUSTOMER — AUTHENTICATION
        =================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ===================================================
            CUSTOMER — ACCOUNT
        =================================================== */}

        <Route
          path="/account"
          element={<Account />}
        />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        <Route
          path="/address"
          element={<Address />}
        />

        {/* ===================================================
            CUSTOMER — ORDERS
        =================================================== */}

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />

        {/* ===================================================
            CUSTOMER — PRODUCTS
        =================================================== */}

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* ===================================================
            CUSTOMER — MEN
        =================================================== */}

        <Route
          path="/men"
          element={
            <CategoryPage
              title="Men's Collection"
              subtitle="Discover contemporary essentials, timeless classics, and everyday styles designed for the modern man."
              products={products.filter(
                (product) =>
                  product.category === "Men"
              )}
            />
          }
        />

        {/* ===================================================
            CUSTOMER — WOMEN
        =================================================== */}

        <Route
          path="/women"
          element={
            <CategoryPage
              title="Women's Collection"
              subtitle="Explore modern silhouettes, effortless essentials, and statement pieces designed for every occasion."
              products={products.filter(
                (product) =>
                  product.category === "Women"
              )}
            />
          }
        />

        {/* ===================================================
            CUSTOMER — KIDS
        =================================================== */}

        <Route
          path="/kids"
          element={
            <CategoryPage
              title="Kids' Collection"
              subtitle="Fun, comfortable, and stylish everyday pieces made for little personalities."
              products={products.filter(
                (product) =>
                  product.category === "Kids"
              )}
            />
          }
        />

        {/* ===================================================
            CUSTOMER — NEW ARRIVALS
        =================================================== */}

        <Route
          path="/new-arrivals"
          element={
            <CategoryPage
              title="New Arrivals"
              subtitle="Fresh styles and the latest pieces from our newest collection."
              products={products.filter(
                (product) =>
                  product.isNew === true
              )}
            />
          }
        />

        {/* ===================================================
            CUSTOMER — SALE
        =================================================== */}

        <Route
          path="/sale"
          element={
            <CategoryPage
              title="Sale"
              subtitle="Shop your favorite styles at special prices while stocks last."
              products={products.filter(
                (product) =>
                  product.isSale === true
              )}
            />
          }
        />

        {/* ===================================================
            CUSTOMER — CART
        =================================================== */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* ===================================================
            CUSTOMER — WISHLIST
        =================================================== */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* ===================================================
            CUSTOMER — CHECKOUT
        =================================================== */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* ===================================================
            CUSTOMER — ORDER SUCCESS
        =================================================== */}

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        {/* ===================================================
            ADMIN — LOGIN
        =================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ===================================================
            ADMIN — DASHBOARD
        =================================================== */}

        <Route
  path="/admin"
  element={<AdminDashboard />}
/>


        {/* ===================================================
            ADMIN — PRODUCTS
        =================================================== */}

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        {/* ===================================================
            ADMIN — ORDERS
        =================================================== */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* ===================================================
            ADMIN — ORDER DETAILS
        =================================================== */}

        <Route
          path="/admin/orders/:id"
          element={<AdminOrderDetails />}
        />

        {/* ===================================================
            ADMIN — CUSTOMERS
        =================================================== */}

        <Route
          path="/admin/customers"
          element={<AdminCustomers />}
        />

        {/* ===================================================
            ADMIN — CUSTOMER DETAILS
        =================================================== */}

        <Route
          path="/admin/customers/:id"
          element={<AdminCustomerDetails />}
        />

        {/* ===================================================
            ADMIN — COUPONS
        =================================================== */}

        <Route
          path="/admin/coupons"
          element={<AdminCoupons />}
        />

        {/* ===================================================
            404
        =================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}

// =========================================================
// EXPORT
// =========================================================

export default App;