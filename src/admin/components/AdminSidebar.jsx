import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-logo">
        <h2>FASHIONSTORE</h2>
        <span>ADMIN PANEL</span>
      </div>

      <nav className="admin-sidebar-nav">

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <span>📊</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <span>👕</span>
          Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <span>📦</span>
          Orders
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <span>👥</span>
          Customers
        </NavLink>

      </nav>

      <div className="admin-sidebar-bottom">

        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <strong>
              {user?.name || "Administrator"}
            </strong>

            <small>
              {user?.email || ""}
            </small>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}