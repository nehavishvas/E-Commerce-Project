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
                className="catalog-tile simple-tile"
              >
                <div className="catalog-tile-image-container">
                  <SmartImage
                    src={entry.meta.featuredProduct?.image || entry.meta.showcaseImages?.[0]}
                    alt={entry.name}
                    fallbackLabel={entry.name}
                    className="catalog-tile-image"
                  />
                </div>
                <div className="catalog-tile-content">
                  <h2>{entry.name}</h2>
                  <p className="catalog-copy">{entry.meta.description}</p>
                </div>
                <div className="catalog-tile-footer">
                  <span>{entry.meta.productCount} Products</span>
                  <span>From ₹{entry.meta.minPrice.toLocaleString("en-IN")}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SubcategoryScreen;
