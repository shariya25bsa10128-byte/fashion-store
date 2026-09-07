const products = [
  // ================================
  // MEN
  // ================================

  {
    id: 1,
    name: "Oversized Cotton Shirt",
    category: "Men",
    subcategory: "Shirts",
    price: 1299,
    oldPrice: 1799,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["White", "Black", "Blue"],
  },

  {
    id: 2,
    name: "Relaxed Fit Denim",
    category: "Men",
    subcategory: "Jeans",
    price: 1899,
    oldPrice: 2499,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",
    badge: "BESTSELLER",
    isNew: false,
    isSale: true,
    colors: ["Blue", "Black"],
  },

  {
    id: 3,
    name: "Classic Black Jacket",
    category: "Men",
    subcategory: "Jackets",
    price: 2999,
    oldPrice: 3999,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["Black", "Brown", "Grey"],
  },

  {
    id: 4,
    name: "Essential White T-Shirt",
    category: "Men",
    subcategory: "T-Shirts",
    price: 799,
    oldPrice: 999,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
    badge: "ESSENTIAL",
    isNew: false,
    isSale: true,
    colors: ["White", "Black", "Grey"],
  },

  // ================================
  // WOMEN
  // ================================

  {
    id: 5,
    name: "Classic Denim Shirt Dress",
    category: "Women",
    subcategory: "Dresses",
    price: 2499,
    oldPrice: 3299,
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=85",
    badge: "TRENDING",
    isNew: true,
    isSale: true,
    colors: ["Beige", "Black", "White"],
  },

  {
    id: 6,
    name: "Minimal Summer Dress",
    category: "Women",
    subcategory: "Dresses",
    price: 1599,
    oldPrice: 2199,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["White", "Pink", "Blue"],
  },

  {
    id: 7,
    name: "Oversized Denim Jacket",
    category: "Women",
    subcategory: "Jackets",
    price: 2199,
    oldPrice: 2999,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["Blue", "Black", "Grey"],
  },

  {
    id: 8,
    name: "Relaxed Linen Shirt",
    category: "Women",
    subcategory: "Shirts",
    price: 1399,
    oldPrice: 1899,
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=85",
    badge: "TRENDING",
    isNew: false,
    isSale: true,
    colors: ["White", "Beige", "Green"],
  },

  // ================================
  // KIDS
  // ================================

  {
    id: 9,
    name: "Kids Casual Hoodie",
    category: "Kids",
    subcategory: "Hoodies",
    price: 899,
    oldPrice: 1199,
    image:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["Blue", "Pink", "Yellow"],
  },

  {
    id: 10,
    name: "Kids Summer Dress",
    category: "Kids",
    subcategory: "Dresses",
    price: 1099,
    oldPrice: 1499,
    image:
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85",
    badge: "NEW",
    isNew: true,
    isSale: true,
    colors: ["Pink", "White", "Yellow"],
  },

  {
    id: 11,
    name: "Kids Casual T-Shirt",
    category: "Kids",
    subcategory: "T-Shirts",
    price: 1299,
    oldPrice: 1699,
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85",
    badge: "BESTSELLER",
    isNew: false,
    isSale: true,
    colors: ["Blue", "Black"],
  },

  {
    id: 12,
    name: "Kids Jacket",
    category: "Kids",
    subcategory: "Jackets",
    price: 599,
    oldPrice: 799,
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=85",
    badge: "ESSENTIAL",
    isNew: false,
    isSale: true,
    colors: ["White", "Blue", "Red"],
  },
];

export default products;