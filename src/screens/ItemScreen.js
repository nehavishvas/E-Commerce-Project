import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import SmartImage from "../componenet/SmartImage";
import Productss from "../Productss";
import { ListProduct, loadCatalog } from "../redux/action/action";
import { findCategoryNode, findSubcategoryNode } from "./catalogUtils";

const ItemScreen = ({ match }) => {
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.catalog);
  const productState = useSelector((state) => state.Productlist);
  const { categorySlug, subcategorySlug } = match.params;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [brand, setBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    dispatch(loadCatalog());
  }, [dispatch]);

  const category = useMemo(
    () => findCategoryNode(catalog.tree, categorySlug),
    [catalog.tree, categorySlug]
  );

  const subcategory = useMemo(
    () => findSubcategoryNode(catalog.tree, categorySlug, subcategorySlug),
    [catalog.tree, categorySlug, subcategorySlug]
  );

  useEffect(() => {
    setSelectedItem("");
    setBrand("");
    setQuery("");
    setSort("featured");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    dispatch(
      ListProduct({
        category: categorySlug,
        subcategory: subcategorySlug,
        item: selectedItem,
        brand,
        q: query,
        sort,
        inStock: inStockOnly,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRating || undefined,
        limit: "all",
      })
    );
  }, [
    dispatch,
    categorySlug,
    subcategorySlug,
    selectedItem,
    brand,
    query,
    sort,
    inStockOnly,
    minPrice,
    maxPrice,
    minRating,
  ]);

  const visibleGroups = useMemo(() => {
    if (!subcategory) {
      return [];
    }

    const groups = subcategory.items.map((item) => ({
      ...item,
      products: productState.Product.filter((product) =>
        item.productIds.includes(product.id)
      ),
    }));

    if (selectedItem) {
      return groups.filter((group) => group.slug === selectedItem);
    }

    return groups.filter((group) => group.products.length > 0);
  }, [subcategory, productState.Product, selectedItem]);

  const facetBrands = useMemo(
    () =>
      (productState.facets?.brands || []).map((entry) =>
        typeof entry === "string" ? { name: entry, count: 0 } : entry
      ),
    [productState.facets]
  );

  const facetRatings = productState.facets?.ratings || [];
  const facetSummary = productState.facets?.summary || {};
  const facetPriceRange = productState.facets?.priceRange || { min: 0, max: 0 };
  const facetStock = productState.facets?.stock || { inStock: 0, outOfStock: 0 };

  const activeFilterCount = [
    query,
    selectedItem,
    brand,
    inStockOnly ? "in-stock" : "",
    minPrice,
    maxPrice,
    minRating,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedItem("");
    setBrand("");
    setQuery("");
    setSort("featured");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
  };

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Products From API</p>
          <h1 className="page-title">{subcategory?.name || "Items"}</h1>
          <p className="page-subtitle">
            Browse live product data for this subcategory with richer filters,
            brand-level breakdowns, rating thresholds, and item-group details.
          </p>
          {subcategory?.meta.shopperNotes?.length > 0 && (
            <div className="note-row">
              {subcategory.meta.shopperNotes.map((note) => (
                <span key={note} className="note-pill">
                  {note}
                </span>
              ))}
            </div>
          )}

          <div className="hero-action-row">
            <button type="button" className="secondary" onClick={resetFilters}>
              Clear filters
            </button>
            {subcategory?.items?.[0] ? (
              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedItem(subcategory.items[0].slug)}
              >
                Focus first item group
              </button>
            ) : null}
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{productState.total}</strong>
            <span>filtered products</span>
          </div>
          <div className="hero-stat">
            <strong>{facetSummary.averageRating || 0}</strong>
            <span>avg rating</span>
          </div>
          <div className="hero-stat">
            <strong>
              ₹{(facetSummary.averagePrice || 0).toLocaleString("en-IN")}
            </strong>
            <span>avg price</span>
          </div>
          <div className="hero-stat">
            <strong>{facetSummary.totalReviews || 0}</strong>
            <span>total reviews</span>
          </div>
        </div>
      </section>

      <div className="breadcrumb-line">
        <Link to="/catalog">Categories</Link>
        {" / "}
        <Link to={`/catalog/${categorySlug}`}>{category?.name || categorySlug}</Link>
        {" / "}
        <span>{subcategory?.name || subcategorySlug}</span>
      </div>

      {catalog.loading || productState.loading ? (
        <LoadingBox />
      ) : catalog.error ? (
        <MassageBox variant="error">{catalog.error}</MassageBox>
      ) : productState.error ? (
        <MassageBox variant="error">{productState.error}</MassageBox>
      ) : !subcategory ? (
        <MassageBox variant="error">Subcategory not found</MassageBox>
      ) : (
        <section className="catalog-section item-page-stack">
          <div className="browse-toolbar browse-toolbar-rich">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products in this subcategory"
            />
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
              <option value="">All item groups</option>
              {subcategory.items.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {facetBrands.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {entry.name}
                  {entry.count ? ` (${entry.count})` : ""}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name</option>
            </select>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any rating</option>
              {facetRatings.map((entry) => (
                <option key={entry.threshold} value={entry.threshold}>
                  {entry.threshold}+ stars ({entry.count})
                </option>
              ))}
            </select>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock only
            </label>
          </div>

          <div className="browse-toolbar browse-toolbar-filters">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
            />
            <button type="button" className="secondary" onClick={resetFilters}>
              Reset filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </button>
          </div>

          <div className="section-summary section-summary-rich">
            <span>{productState.total} products from API</span>
            <span>
              Price range: ₹
              {facetPriceRange.min.toLocaleString("en-IN")} - ₹
              {facetPriceRange.max.toLocaleString("en-IN")}
            </span>
            <span>{facetBrands.length} brands</span>
            <span>{facetStock.inStock || 0} in stock</span>
            <span>{visibleGroups.length} visible item groups</span>
          </div>

          {facetBrands.length > 0 && (
            <div className="filter-chip-row">
              {facetBrands.slice(0, 8).map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  className={`filter-chip ${brand === entry.name ? "active" : ""}`}
                  onClick={() => setBrand(brand === entry.name ? "" : entry.name)}
                >
                  {entry.name}
                  {entry.count ? <span>{entry.count}</span> : null}
                </button>
              ))}
            </div>
          )}

          {visibleGroups.map((item) => (
            <div key={item.slug} className="item-group">
              <div className="item-group-header">
                <div>
                  <p className="eyebrow">Item</p>
                  <h2>{item.name}</h2>
                  <p className="item-group-copy">
                    {item.meta.brands.join(", ")} · {item.products.length} API products
                  </p>
                </div>
                <span>{item.products.length} loaded</span>
              </div>
              <div className="item-detail-grid">
                <div>
                  <strong>{item.meta.averageRating}</strong>
                  <span>Average rating</span>
                </div>
                <div>
                  <strong>{item.meta.inStockCount}</strong>
                  <span>Ready to ship</span>
                </div>
                <div>
                  <strong>
                    ₹{item.meta.minPrice.toLocaleString("en-IN")} - ₹
                    {item.meta.maxPrice.toLocaleString("en-IN")}
                  </strong>
                  <span>Price band</span>
                </div>
                <div>
                  <strong>{item.meta.reviewCount || 0}</strong>
                  <span>Total reviews</span>
                </div>
              </div>
              {item.description ? (
                <p className="item-group-copy">{item.description}</p>
              ) : null}

              <div className="raw center">
                <Productss Product={item.products} />
              </div>
            </div>
          ))}

          {visibleGroups.length === 0 && (
            <div className="empty-state">
              <h2>No products match these filters</h2>
              <p className="page-subtitle">
                Reset the filters or switch item groups to keep browsing this subcategory.
              </p>
              <button type="button" className="primary" onClick={resetFilters}>
                Reset and show all
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ItemScreen;
