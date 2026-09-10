import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function WishlistProvider({ children }) {
  const {
    user,
    token,
    isLoggedIn,
  } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // =======================================================
  // LOAD WISHLIST
  // =======================================================

  const fetchWishlist = async () => {
    if (!isLoggedIn || !user?.id || !token) {
      setWishlistItems([]);
      setWishlistLoading(false);
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await fetch(
        `${API_URL}/wishlist/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch wishlist"
        );
      }

      setWishlistItems(
        result.data?.items || []
      );
    } catch (error) {
      console.error(
        "Fetch wishlist error:",
        error
      );

      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // =======================================================
  // LOAD WHEN LOGIN CHANGES
  // =======================================================

  useEffect(() => {
    fetchWishlist();
  }, [isLoggedIn, user?.id, token]);

  // =======================================================
  // CHECK WISHLIST
  // =======================================================

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) =>
        Number(item.id) === Number(productId)
    );
  };

  // =======================================================
  // ADD TO WISHLIST
  // =======================================================

  const addToWishlist = async (product) => {
    if (!isLoggedIn || !user?.id || !token) {
      console.warn(
        "Please login before adding to wishlist."
      );
      return;
    }

    try {
      const productId = Number(product.id);

      if (!Number.isInteger(productId)) {
        console.error(
          "Invalid product ID:",
          product.id
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/wishlist/${user.id}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to add product to wishlist"
        );
      }

      await fetchWishlist();

    } catch (error) {
      console.error(
        "Add wishlist error:",
        error
      );
    }
  };

  // =======================================================
  // REMOVE FROM WISHLIST
  // =======================================================

  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn || !user?.id || !token) {
      return;
    }

    try {
      const wishlistItem =
        wishlistItems.find(
          (item) =>
            Number(item.id) ===
            Number(productId)
        );

      if (!wishlistItem) {
        console.warn(
          "Wishlist item not found for product:",
          productId
        );
        return;
      }

      const wishlistItemId =
        wishlistItem.wishlistItemId;

      if (!wishlistItemId) {
        console.error(
          "Missing wishlistItemId:",
          wishlistItem
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/wishlist/${user.id}/items/${wishlistItemId}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to remove product from wishlist"
        );
      }

      await fetchWishlist();

    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );
    }
  };

  // =======================================================
  // TOGGLE WISHLIST
  // =======================================================

  const toggleWishlist = async (product) => {
    if (!isLoggedIn || !user?.id || !token) {
      console.warn(
        "Please login before using wishlist."
      );
      return;
    }

    const exists =
      isInWishlist(product.id);

    if (exists) {
      await removeFromWishlist(
        product.id
      );
    } else {
      await addToWishlist(product);
    }
  };

  // =======================================================
  // COUNT
  // =======================================================

  const wishlistCount =
    wishlistItems.length;

  // =======================================================
  // PROVIDER
  // =======================================================

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        wishlistLoading,

        isInWishlist,

        addToWishlist,
        removeFromWishlist,
        toggleWishlist,

        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export function useWishlist() {
  return useContext(WishlistContext);
}