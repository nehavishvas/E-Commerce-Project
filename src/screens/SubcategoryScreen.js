import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import SmartImage from "../componenet/SmartImage";
import { loadCatalog } from "../redux/action/action";
import { findCategoryNode } from "./catalogUtils";

const SubcategoryScreen = ({ match }) => {
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.catalog);
  const categorySlug = match.params.categorySlug;

  useEffect(() => {
    dispatch(loadCatalog());
  }, [dispatch]);

  const category = useMemo(
    () => findCategoryNode(catalog.tree, categorySlug),
    [catalog.tree, categorySlug]
  );

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Subcategory Page</p>
          <h1 className="page-title">{category?.name || "Subcategories"}</h1>
          <p className="page-subtitle">
            {category?.meta.description || "Choose a subcategory inside the selected category."}
          </p>
          {category?.meta.shopperNotes?.length > 0 && (
            <div className="note-row">
              {category.meta.shopperNotes.map((note) => (
                <span key={note} className="note-pill">
                  {note}
                </span>
              ))}
            </div>
          )}
          {category?.meta.facts?.length > 0 && (
            <div className="fact-row">
              {category.meta.facts.map((fact) => (
                <span key={fact} className="fact-pill">
                  {fact}
                </span>
              ))}
            </div>
          )}
          {category?.meta.gallery?.length > 0 && (
            <div className="hero-gallery">
              {category.meta.gallery.map((image) => (
                <SmartImage
                  key={image}
                  src={image}
                  alt={category.name}
                  fallbackLabel={category.name}
                  className="hero-gallery-image"
                />
              ))}
            </div>
          )}
        </div>
        {category?.meta.heroImage && (
          <SmartImage
            src={category.meta.heroImage}
            alt={category.name}
            fallbackLabel={category.name}
            className="hero-banner-image"
          />
        )}
      </section>

      <div className="breadcrumb-line">
        <Link to="/catalog">Categories</Link>
        {" / "}
        <span>{category?.name || categorySlug}</span>
      </div>

      {catalog.loading ? (
        <LoadingBox />
      ) : catalog.error ? (
        <MassageBox variant="error">{catalog.error}</MassageBox>
      ) : !category ? (
        <MassageBox variant="error">Category not found</MassageBox>
      ) : (
        <section className="catalog-section">
          <div className="section-summary">
            <span>{category.subcategories.length} subcategories</span>
            <span>
              {category.subcategories.reduce(
                (total, entry) => total + entry.items.length,
                0
              )}{" "}
              item groups
            </span>
            <span>{category.meta.priceBand}</span>
          </div>
          <div className="tile-grid">
            {category.subcategories.map((entry) => (
              <Link
                key={entry.slug}
                to={`/catalog/${category.slug}/${entry.slug}`}
                className="catalog-tile"
              >
                <div className="catalog-tile-top">
                  <div>
                    <p className="eyebrow">Subcategory</p>
                    <h2>{entry.name}</h2>
                    <p className="catalog-copy">{entry.meta.description}</p>
                  </div>
                  {entry.meta.featuredProduct?.image && (
                    <SmartImage
                      src={entry.meta.featuredProduct.image}
                      alt={entry.meta.featuredProduct.name}
                      fallbackLabel={entry.meta.featuredProduct.name}
                      className="catalog-thumb"
                    />
                  )}
                </div>
                <div className="catalog-meta-grid">
                  <div>
                    <strong>{entry.meta.itemCount}</strong>
                    <span>Item groups</span>
                  </div>
                  <div>
                    <strong>{entry.meta.productCount}</strong>
                    <span>Products</span>
                  </div>
                  <div>
                    <strong>{entry.meta.inStockCount}</strong>
                    <span>In stock</span>
                  </div>
                  <div>
                    <strong>
                      ₹{entry.meta.minPrice.toLocaleString("en-IN")} - ₹
                      {entry.meta.maxPrice.toLocaleString("en-IN")}
                    </strong>
                    <span>Price range</span>
                  </div>
                </div>
                <p className="catalog-brands">
                  Brands: {entry.meta.brands.join(", ")}
                </p>
                {entry.meta.topItems?.length > 0 && (
                  <div className="detail-chip-row">
                    {entry.meta.topItems.map((item) => (
                      <span key={item} className="detail-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                <div className="catalog-image-strip">
                  {entry.meta.showcaseImages.map((image) => (
                    <SmartImage
                      key={image}
                      src={image}
                      alt={entry.name}
                      fallbackLabel={entry.name}
                      className="catalog-strip-image"
                    />
                  ))}
                </div>
                {entry.meta.itemSpotlights?.length > 0 && (
                  <div className="mini-card-grid">
                    {entry.meta.itemSpotlights.map((item) => (
                      <div key={item.slug} className="mini-card">
                        {item.image && (
                          <SmartImage
                            src={item.image}
                            alt={item.name}
                            fallbackLabel={item.name}
                            className="mini-card-image"
                          />
                        )}
                        <strong>{item.name}</strong>
                        <span>{item.productCount} products</span>
                      </div>
                    ))}
                  </div>
                )}
                {entry.meta.heroStats?.length > 0 && (
                  <div className="inline-stat-row">
                    {entry.meta.heroStats.map((stat) => (
                      <div key={stat.label} className="inline-stat-card">
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {entry.meta.shopperNotes?.length > 0 && (
                  <div className="catalog-note-list">
                    {entry.meta.shopperNotes.map((note) => (
                      <span key={note}>{note}</span>
                    ))}
                  </div>
                )}
                {entry.meta.facts?.length > 0 && (
                  <div className="catalog-fact-list">
                    {entry.meta.facts.map((fact) => (
                      <span key={fact}>{fact}</span>
                    ))}
                  </div>
                )}
                {entry.meta.highlights.length > 0 && (
                  <div className="catalog-highlight-row">
                    {entry.meta.highlights.map((highlight) => (
                      <span key={highlight} className="catalog-highlight-pill">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SubcategoryScreen;
