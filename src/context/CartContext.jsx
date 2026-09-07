import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

/* =========================================
   CART PROVIDER
========================================= */

export function CartProvider({ children }) {
  /* =========================================
     LOAD CART
  ========================================= */

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("fashionStoreCart");

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart)
        ? parsedCart
        : [];
    } catch (error) {
      console.error(
        "Error loading cart:",
        error
      );

      return [];
    }
  });

  /* =========================================
     SAVE CART TO LOCAL STORAGE
  ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "fashionStoreCart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Error saving cart:",
        error
      );
    }
  }, [cartItems]);

  /* =========================================
     ADD TO CART
     
     IMPORTANT:
     Product + Size + Color = UNIQUE CART ITEM
  ========================================= */

  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error(
        "addToCart: Invalid product",
        product
      );

      return;
    }

    setCartItems((currentItems) => {
      /* ---------------------------------------
         NORMALIZE OPTIONS
      --------------------------------------- */

      const selectedSize =
        product.selectedSize || null;

      const selectedColor =
        product.selectedColor || null;

      /* ---------------------------------------
         CHECK EXISTING ITEM
         
         Same product + same size + same color
         = increase quantity
         
         Different color or size
         = separate cart item
      --------------------------------------- */

      const existingItem =
        currentItems.find(
          (item) =>
            Number(item.id) ===
              Number(product.id) &&
            (item.selectedSize || null) ===
              selectedSize &&
            (item.selectedColor || null) ===
              selectedColor
        );

      /* ---------------------------------------
         EXISTING ITEM
      --------------------------------------- */

      if (existingItem) {
        return currentItems.map((item) =>
          Number(item.id) ===
            Number(product.id) &&
          (item.selectedSize || null) ===
            selectedSize &&
          (item.selectedColor || null) ===
            selectedColor
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1,
              }
            : item
        );
      }

      /* ---------------------------------------
         NEW ITEM
      --------------------------------------- */

      return [
        ...currentItems,
        {
          ...product,

          selectedSize,
          selectedColor,

          quantity: 1,
        },
      ];
    });
  };

  /* =========================================
     REMOVE FROM CART
     
     Product + Size + Color
  ========================================= */

  const removeFromCart = (
    productId,
    selectedSize = null,
    selectedColor = null
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            Number(item.id) ===
              Number(productId) &&
            (item.selectedSize || null) ===
              (selectedSize || null) &&
            (item.selectedColor || null) ===
              (selectedColor || null)
          )
      )
    );
  };

  /* =========================================
     INCREASE QUANTITY
     
     Product + Size + Color
  ========================================= */

  const increaseQuantity = (
    productId,
    selectedSize = null,
    selectedColor = null
  ) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        Number(item.id) ===
          Number(productId) &&
        (item.selectedSize || null) ===
          (selectedSize || null) &&
        (item.selectedColor || null) ===
          (selectedColor || null)
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + 1,
            }
          : item
      )
    );
  };

  /* =========================================
     DECREASE QUANTITY
     
     Product + Size + Color
  ========================================= */

  const decreaseQuantity = (
    productId,
    selectedSize = null,
    selectedColor = null
  ) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          Number(item.id) ===
            Number(productId) &&
          (item.selectedSize || null) ===
            (selectedSize || null) &&
          (item.selectedColor || null) ===
            (selectedColor || null)
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter(
          (item) =>
            Number(item.quantity || 0) > 0
        )
    );
  };

  /* =========================================
     CLEAR CART
  ========================================= */

  const clearCart = () => {
    setCartItems([]);
  };

  /* =========================================
     CART COUNT
     
     Total number of products
  ========================================= */

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  /* =========================================
     CART SUBTOTAL
  ========================================= */

  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /* =========================================
     CONTEXT
  ========================================= */

  return (
    <CartContext.Provider
      value={{
        cartItems,

        cartCount,

        cartSubtotal,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================
   USE CART HOOK
========================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}