import { createContext, useContext, useEffect, useState } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // LOAD ADMIN SESSION
  // -------------------------------------------------------

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");

      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("Failed to load admin session:", error);
      localStorage.removeItem("admin");
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------

  const loginAdmin = (adminData) => {
    localStorage.setItem("admin", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  // -------------------------------------------------------
  // AUTH STATUS
  // -------------------------------------------------------

  const isAdminLoggedIn = !!admin;

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// ---------------------------------------------------------
// CUSTOM HOOK
// ---------------------------------------------------------

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdmin must be used inside an AdminProvider"
    );
  }

  return context;
}