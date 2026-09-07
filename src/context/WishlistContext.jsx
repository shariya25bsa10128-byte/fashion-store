import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---------------------------------------------------------
// TEMPORARY USER ID
// ---------------------------------------------------------
// We are currently using user ID 4 because that is the
// user we have been testing with in the backend.
//
// Later, when login/authentication is connected, we will
// replace this with the logged-in user's ID.
// ---------------------------------------------------------

const USER_ID = 4;

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // =======================================================
  // LOAD WISHLIST FROM BACKEND
  // =======================================================

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);

      const response = await fetch(
        `${API_URL}/wishlist/${USER_ID}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch wishlist"
        );
      }

      // Backend returns:
      // data.items = [...]

      setWishlistItems(result.data?.items || []);
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
  // LOAD WISHLIST WHEN APP STARTS
  // =======================================================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =======================================================
  // CHECK IF PRODUCT IS IN WISHLIST
  // =======================================================

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => Number(item.id) === Number(productId)
    );
  };

  // =======================================================
  // ADD PRODUCT TO WISHLIST
  // =======================================================

  const addToWishlist = async (product) => {
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
        `${API_URL}/wishlist/${USER_ID}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
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

      // If already in wishlist, don't duplicate it.
      if (
        result.message ===
        "Product is already in wishlist"
      ) {
        await fetchWishlist();
        return;
      }

      // Refresh from backend so frontend always
      // matches PostgreSQL.
      await fetchWishlist();

    } catch (error) {
      console.error(
        "Add wishlist error:",
        error
      );
    }
  };

  // =======================================================
  // REMOVE PRODUCT FROM WISHLIST
  // =======================================================

  const removeFromWishlist = async (productId) => {
    try {
      // Find wishlist item using product ID
      const wishlistItem = wishlistItems.find(
        (item) =>
          Number(item.id) === Number(productId)
      );

      if (!wishlistItem) {
        console.warn(
          "Wishlist item not found for product:",
          productId
        );
        return;
      }

      // Backend gives us wishlistItemId
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
        `${API_URL}/wishlist/${USER_ID}/items/${wishlistItemId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to remove product from wishlist"
        );
      }

      // Refresh from backend
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
    const exists = isInWishlist(product.id);

    if (exists) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  // =======================================================
  // WISHLIST COUNT
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