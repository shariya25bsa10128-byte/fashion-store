import { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

import ProductCard from "../components/ProductCard";

function CategoryPage({
  title,
  subtitle,
  products = [],
}) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortBy, setSortBy] =
    useState("featured");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [maxPrice, setMaxPrice] =
    useState(10000);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  /* =========================================
     GET CATEGORIES
  ========================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.subcategory)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories;
  }, [products]);

  /* =========================================
     FILTER + SEARCH + SORT
  ========================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* SEARCH */

    if (searchQuery.trim()) {
      const query =
        searchQuery.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name
            ?.toLowerCase()
            .includes(query) ||
          product.category
            ?.toLowerCase()
            .includes(query) ||
          product.subcategory
            ?.toLowerCase()
            .includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    /* CATEGORY */

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.subcategory ===
          selectedCategory
      );
    }

    /* PRICE */

    result = result.filter(
      (product) =>
        Number(product.price) <= maxPrice
    );

    /* SORT */

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) => a.price - b.price
        );
        break;

      case "price-high":
        result.sort(
          (a, b) => b.price - a.price
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "newest":
        result.sort(
          (a, b) =>
            Number(Boolean(b.isNew)) -
            Number(Boolean(a.isNew))
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    maxPrice,
    sortBy,
  ]);

  /* =========================================
     RESET FILTERS
  ========================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMaxPrice(10000);
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    maxPrice < 10000 ||
    sortBy !== "featured";

  return (
    <main className="category-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <section className="category-header">

        <p className="category-eyebrow">
          COLLECTION
        </p>

        <h1>
          {title}
        </h1>

        {subtitle && (
          <p className="category-subtitle">
            {subtitle}
          </p>
        )}

      </section>

      {/* =====================================
          SHOP TOOLBAR
      ===================================== */}

      <section className="category-toolbar">

        {/* SEARCH */}

        <div className="category-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search this collection..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
          />

          {searchQuery && (
            <button
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}

        </div>

        {/* FILTER BUTTON */}

        <button
          className={
            filtersOpen
              ? "filter-toggle active"
              : "filter-toggle"
          }
          onClick={() =>
            setFiltersOpen(!filtersOpen)
          }
        >
          <SlidersHorizontal size={16} />

          FILTERS
        </button>

        {/* SORT */}

        <div className="sort-wrapper">

          <span>
            SORT BY
          </span>

          <div className="sort-select-wrapper">

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name">
                Name
              </option>
            </select>

            <ChevronDown size={14} />

          </div>

        </div>

      </section>

      {/* =====================================
          FILTER PANEL
      ===================================== */}

      {filtersOpen && (
        <section className="category-filters">

          <div className="filter-group">

            <h3>
              CATEGORY
            </h3>

            <div className="filter-category-list">

              <button
                className={
                  selectedCategory === "all"
                    ? "category-filter active"
                    : "category-filter"
                }
                onClick={() =>
                  setSelectedCategory("all")
                }
              >
                ALL
              </button>

              {categories.map((category) => (

                <button
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? "category-filter active"
                      : "category-filter"
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              ))}

            </div>

          </div>

          <div className="filter-group price-filter">

            <div className="price-filter-header">

              <h3>
                MAXIMUM PRICE
              </h3>

              <strong>
                ₹
                {maxPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(
                  Number(event.target.value)
                )
              }
            />

            <div className="price-range-labels">

              <span>
                ₹500
              </span>

              <span>
                ₹10,000+
              </span>

            </div>

          </div>

          {hasActiveFilters && (
            <button
              className="reset-filters"
              onClick={resetFilters}
            >
              <X size={14} />
              CLEAR ALL FILTERS
            </button>
          )}

        </section>
      )}

      {/* =====================================
          RESULTS INFO
      ===================================== */}

      <section className="category-results-bar">

        <span>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "PRODUCT"
            : "PRODUCTS"}
        </span>

        {hasActiveFilters && (
          <span className="filters-applied">
            FILTERS APPLIED
          </span>
        )}

      </section>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      {filteredProducts.length > 0 ? (

        <section className="category-products-grid">

          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </section>

      ) : (

        /* =====================================
            NO RESULTS
        ===================================== */

        <section className="category-empty">

          <Search size={35} />

          <h2>
            No Products Found
          </h2>

          <p>
            Try changing your search or
            adjusting your filters.
          </p>

          <button
            onClick={resetFilters}
          >
            CLEAR FILTERS
          </button>

        </section>

      )}

    </main>
  );
}

export default CategoryPage;