import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="admin-header">

      <div>
        <h1>Admin Dashboard</h1>

        <p>
          Welcome back,{" "}
          <strong>
            {user?.name || "Administrator"}
          </strong>
        </p>
      </div>

      <div className="admin-header-user">
        <div className="admin-header-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div>
          <strong>
            {user?.name || "Administrator"}
          </strong>

          <span>Administrator</span>
        </div>
      </div>

    </header>
  );
}