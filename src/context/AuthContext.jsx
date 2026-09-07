
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";

const USER_KEY = "fashionstore_user";
const TOKEN_KEY = "fashionstore_token";

// =========================================================
// AUTH PROVIDER
// =========================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // =======================================================
  // LOAD SAVED LOGIN
  // =======================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(USER_KEY);

      const savedToken =
        localStorage.getItem(TOKEN_KEY);

      if (savedUser && savedToken) {
        const parsedUser =
          JSON.parse(savedUser);

        if (parsedUser?.id) {
          setUser(parsedUser);
          setToken(savedToken);
        } else {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load authentication:",
        error
      );

      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);

      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // SAVE LOGIN
  // =======================================================

  const saveLogin = (userData, authToken) => {
    const loggedInUser = {
      ...userData,
      loggedIn: true,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem(
      TOKEN_KEY,
      authToken
    );

    setUser(loggedInUser);
    setToken(authToken);
  };

  // =======================================================
  // SIGNUP
  // =======================================================

  const signup = async (signupData) => {
    try {
      const response = await fetch(
        `${API_URL}/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(signupData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to create account.",
        };
      }

      // If backend returns a token,
      // automatically log the user in.
      if (data.token && data.user) {
        saveLogin(
          data.user,
          data.token
        );
      }

      return {
        success: true,
        user: data.user,
        token: data.token || null,
        message:
          data.message ||
          "Account created successfully.",
      };
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the backend server.",
      };
    }
  };

  // =======================================================
  // LOGIN
  // =======================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email:
              String(email)
                .trim()
                .toLowerCase(),

            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Invalid email or password.",
        };
      }

      if (!data.token) {
        return {
          success: false,
          message:
            "Login failed because the server did not return a token.",
        };
      }

      saveLogin(
        data.user,
        data.token
      );

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the backend server.",
      };
    }
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);

    setUser(null);
    setToken(null);
  };

  // =======================================================
  // GET TOKEN
  // =======================================================

  const getToken = () => {
    return localStorage.getItem(
      TOKEN_KEY
    );
  };

  // =======================================================
  // UPDATE USER
  // =======================================================

  const updateUser = (updatedUser) => {
    const newUser = {
      ...updatedUser,
      loggedIn: true,
      loginTime:
        user?.loginTime ||
        new Date().toISOString(),
    };

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(newUser)
    );

    setUser(newUser);
  };

  // =======================================================
  // UPDATE PROFILE
  // =======================================================

  const updateProfile = async (
    profileData
  ) => {
    try {
      if (!user?.id) {
        return {
          success: false,
          message:
            "You must be logged in.",
        };
      }

      const currentToken =
        token ||
        getToken();

      if (!currentToken) {
        return {
          success: false,
          message:
            "Your login session has expired. Please log in again.",
        };
      }

      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentToken}`,
          },

          body: JSON.stringify({
            userId: user.id,

            name:
              profileData.name ??
              user.name ??
              "",

            username:
              profileData.username ??
              user.username ??
              "",

            email:
              profileData.email ??
              user.email ??
              "",

            phone:
              profileData.phone ??
              user.phone ??
              "",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();

        return {
          success: false,
          message:
            "Your login session has expired. Please log in again.",
        };
      }

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to update profile.",
        };
      }

      const newUser = {
        ...data.user,
        loggedIn: true,
        loginTime:
          user.loginTime ||
          new Date().toISOString(),
      };

      const newToken =
        data.token ||
        currentToken;

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(newUser)
      );

      localStorage.setItem(
        TOKEN_KEY,
        newToken
      );

      setUser(newUser);
      setToken(newToken);

      return {
        success: true,
        user: newUser,
        token: newToken,
        message:
          data.message ||
          "Profile updated successfully.",
      };
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the backend server.",
      };
    }
  };

  // =======================================================
  // CURRENT USER
  // =======================================================

  const getCurrentUser = async () => {
    try {
      if (!user?.id) {
        return {
          success: false,
          message:
            "No logged-in user found.",
        };
      }

      const currentToken =
        token ||
        getToken();

      if (!currentToken) {
        return {
          success: false,
          message:
            "No authentication token found.",
        };
      }

      const response = await fetch(
        `${API_URL}/me?userId=${user.id}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${currentToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();

        return {
          success: false,
          message:
            "Your login session has expired.",
        };
      }

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to load user.",
        };
      }

      const updatedUser = {
        ...data.user,
        loggedIn: true,
        loginTime:
          user.loginTime ||
          new Date().toISOString(),
      };

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the backend server.",
      };
    }
  };

  // =======================================================
  // AUTH STATUS
  // =======================================================

  const isLoggedIn =
    Boolean(user?.id && token);

  // =======================================================
  // PROVIDER
  // =======================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,

        setUser,
        setToken,

        loading,
        isLoggedIn,

        login,
        signup,
        logout,

        updateUser,
        updateProfile,

        getToken,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}