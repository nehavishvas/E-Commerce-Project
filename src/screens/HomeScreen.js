import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import SmartImage from "../componenet/SmartImage";
import { loadCatalog } from "../redux/action/action";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.catalog);

  useEffect(() => {
    dispatch(loadCatalog());
  }, [dispatch]);

  const featuredCategory = catalog.tree[0];
  const featuredSubcategory = featuredCategory?.subcategories?.[0];

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Start Here</p>
          <h1 className="page-title">Browse categories and move into products quickly.</h1>
          <p className="page-subtitle">
            Start with a category, narrow to subcategory and item group, then
            continue into product detail, cart, and checkout.
          </p>
          {featuredCategory?.meta.shopperNotes?.length > 0 && (
            <div className="note-row">
              {featuredCategory.meta.shopperNotes.map((note) => (
                <span key={note} className="note-pill">
                  {note}
                </span>
              ))}
            </div>
          )}
          {featuredCategory?.meta.facts?.length > 0 && (
            <div className="fact-row">
              {featuredCategory.meta.facts.map((fact) => (
                <span key={fact} className="fact-pill">
                  {fact}
                </span>
              ))}
            </div>
          )}
          <div className="hero-action-row">
            <Link to="/catalog" className="primary-link">
              Explore categories
            </Link>
            {featuredSubcategory ? (
              <Link
                to={`/catalog/${featuredCategory.slug}/${featuredSubcategory.slug}`}
                className="secondary"
              >
                Jump to live products
              </Link>
            ) : null}
          </div>
          <div className="hero-gallery">
            {catalog.tree.slice(0, 3).map((entry) =>
              entry.meta.heroImage ? (
                <SmartImage
                  key={entry.slug}
                  src={entry.meta.heroImage}
                  alt={entry.name}
                  fallbackLabel={entry.name}
                  className="hero-gallery-image"
                />
              ) : null
            )}
          </div>
        </div>
        {catalog.stats && (
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{catalog.stats.categories}</strong>
              <span>categories</span>
            </div>
            <div className="hero-stat">
              <strong>{catalog.stats.subcategories}</strong>
              <span>subcategories</span>
            </div>
            <div className="hero-stat">
              <strong>{catalog.stats.items}</strong>
              <span>items</span>
            </div>
            <div className="hero-stat">
              <strong>{catalog.stats.products}</strong>
              <span>products</span>
            </div>
          </div>
        )}
      </section>

      {catalog.loading ? (
        <LoadingBox />
      ) : catalog.error ? (
        <MassageBox variant="error">{catalog.error}</MassageBox>
      ) : (
        <section className="catalog-section">
          <div className="tile-grid">
            {catalog.tree.map((entry) => (
              <Link
                key={entry.slug}
                to={`/catalog/${entry.slug}`}
                className="catalog-tile simple-tile"
              >
                <div className="catalog-tile-image-container">
                  <SmartImage
                    src={entry.meta.featuredProduct?.image || entry.meta.heroImage || entry.meta.showcaseImages?.[0]}
                    alt={entry.name}
                    fallbackLabel={entry.name}
                    className="catalog-tile-image"
                  />
                </div>
                <div className="catalog-tile-content">
                  <h2>{entry.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeScreen;
