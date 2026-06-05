import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Rating from "../componenet/Rating";
import { useDispatch, useSelector } from "react-redux";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import { detailProduct, submitReview } from "../redux/action/action";
import Productss from "../Productss";
import SmartImage from "../componenet/SmartImage";

export const ProductScreen = (props) => {
  const dispatch = useDispatch();
  const productId = props.match.params.id;
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const productdetail = useSelector((state) => state.productdetail);
  const auth = useSelector((state) => state.auth);
  const {
    loading,
    error,
    Product,
    relatedProducts,
    reviewLoading,
    reviewError,
    reviewSuccess,
  } = productdetail;
  const detailEntries = Product?.itemDetails
    ? Object.entries(Product.itemDetails)
    : [];
  const highlightEntries = detailEntries.slice(0, 4);
  const reviews = Product?.reviews || [];
  const breadcrumbTarget = Product
    ? `/catalog/${Product.categorySlug}/${Product.subcategorySlug}`
    : "/catalog";

  useEffect(() => {
    dispatch(detailProduct(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (reviewSuccess) {
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
      });
    }
  }, [reviewSuccess]);

  const handleAddToCart = () => {
    const target = `/cart/${productId}?qty=${quantity}`;
    if (!auth.user) {
      props.history.push(`/signin?redirect=${encodeURIComponent(target)}`);
      return;
    }

    props.history.push(target);
  };

  const reviewSubmitHandler = (e) => {
    e.preventDefault();
    dispatch(
      submitReview(productId, {
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      })
    );
  };

  return (
    <div className="product-detail">
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MassageBox variant="error">{error}</MassageBox>
      ) : Product ? (
        <div>
          <Link to={breadcrumbTarget} className="back-link">
            Back to Products
          </Link>

          <div className="breadcrumb-line">
            {Product.category} / {Product.subcategory} / {Product.itemName} / Detail
          </div>

          <div className="raw top">
            <div className="col-2">
              <div className="product-image-container">
                <SmartImage
                  className="large"
                  src={Product.image}
                  alt={Product.name}
                  fallbackLabel={Product.brand || Product.itemName || Product.name}
                />
              </div>
            </div>

            <div className="col-1 product-info">
              <ul>
                <li>
                  <span className="product-brand">{Product.brand}</span>
                </li>
                <li>
                  <h1>{Product.name}</h1>
                </li>
                <li>
                  <Rating
                    rating={Product.rating}
                    numReviews={Product.numReviews}
                  />
                  <span className="rating-inline">
                    {Product.numReviews || 0} reviews
                  </span>
                </li>
                <li>
                  <div className="product-price-large">
                    ₹{Product.price ? Product.price.toLocaleString("en-IN") : "N/A"}
                  </div>
                </li>
                <li>
                  <div className="product-callouts">
                    <span>{Product.countInStock > 0 ? "In stock now" : "Limited availability"}</span>
                    <span>{Product.brand} verified listing</span>
                    <span>Fast checkout support</span>
                  </div>
                </li>
                <li>
                  <p className="product-description">{Product.description}</p>
                </li>
                {highlightEntries.length > 0 && (
                  <li>
                    <div className="spec-chip-row">
                      {highlightEntries.map(([key, value]) => (
                        <div key={key} className="spec-chip">
                          <span>{key.replace(/([A-Z])/g, " ").trim()}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  </li>
                )}
                <li>
                  <div className="detail-grid">
                    <span>Category</span>
                    <strong>{Product.category}</strong>
                    <span>Subcategory</span>
                    <strong>{Product.subcategory}</strong>
                    <span>Item</span>
                    <strong>{Product.itemName}</strong>
                    <span>Stock</span>
                    <strong>{Product.countInStock}</strong>
                    {detailEntries.map(([key, value]) => (
                      <React.Fragment key={key}>
                        <span>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (text) =>
                            text.toUpperCase()
                          )}
                        </span>
                        <strong>{value}</strong>
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-1">
              <div className="purchase-card">
                <div className="purchase-row">
                  <span className="purchase-label">Price</span>
                  <span className="purchase-value">
                    ₹{Product.price ? Product.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>

                <div className="purchase-row">
                  <span className="purchase-label">Status</span>
                  <span className="purchase-value">
                    {Product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="purchase-row">
                  <span className="purchase-label">Delivery</span>
                  <span className="purchase-value">Estimated in 2-4 days</span>
                </div>

                <div className="purchase-row">
                  <span className="purchase-label">Fulfillment</span>
                  <span className="purchase-value">Ships from ShopZone</span>
                </div>

                <div className="purchase-confidence">
                  <div>
                    <strong>{Product.rating || 0}</strong>
                    <span>Rated by shoppers</span>
                  </div>
                  <div>
                    <strong>{Product.numReviews || 0}</strong>
                    <span>Review count</span>
                  </div>
                  <div>
                    <strong>{Math.min(Product.countInStock || 0, 10)}</strong>
                    <span>Units ready now</span>
                  </div>
                </div>

                {Product.countInStock > 0 && (
                  <>
                    <div className="purchase-row">
                      <span className="purchase-label">Quantity</span>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        id="quantity-select"
                      >
                        {[...Array(Math.min(Product.countInStock, 10)).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {!auth.user && (
                      <MassageBox>
                        Sign in is required before adding items to cart.
                      </MassageBox>
                    )}

                    <button
                      onClick={handleAddToCart}
                      className="primary block"
                      id="add-to-cart-btn"
                    >
                      Add to Cart and Continue
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="detail-sections">
            <div className="detail-card">
              <p className="eyebrow">Overview</p>
              <h2>Why this product stands out</h2>
              <p className="page-subtitle">
                {Product.name} belongs to {Product.itemName} under{" "}
                {Product.subcategory}. It is positioned for shoppers looking for{" "}
                {detailEntries
                  .slice(0, 2)
                  .map(([, value]) => value)
                  .join(" and ") || "balanced everyday performance"}
                .
              </p>
              <div className="overview-metrics">
                <div className="inline-stat-card">
                  <strong>{Product.category}</strong>
                  <span>Category lane</span>
                </div>
                <div className="inline-stat-card">
                  <strong>{Product.itemName}</strong>
                  <span>Item group</span>
                </div>
                <div className="inline-stat-card">
                  <strong>₹{Product.price ? Product.price.toLocaleString("en-IN") : "N/A"}</strong>
                  <span>Current price</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <p className="eyebrow">Reviews</p>
              <h2>Customer feedback</h2>
              <div className="review-summary">
                <div>
                  <strong>{Product.rating || 0}</strong>
                  <span>Average rating</span>
                </div>
                <div>
                  <strong>{Product.numReviews || 0}</strong>
                  <span>Total reviews</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="review-list">
                  {reviews.map((review, index) => (
                    <div
                      key={`${review.userId}-${review.createdAt || index}`}
                      className="review-card"
                    >
                      <div className="review-card-top">
                        <div>
                          <strong>{review.title}</strong>
                          <span>{review.name}</span>
                        </div>
                        <div className="review-rating">{review.rating}/5</div>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <MassageBox>No reviews yet. Be the first to review.</MassageBox>
              )}

              {auth.user ? (
                <form onSubmit={reviewSubmitHandler} className="review-form">
                  <h3>Write a review</h3>
                  {reviewError && <MassageBox variant="error">{reviewError}</MassageBox>}
                  {reviewSuccess && (
                    <MassageBox variant="success">{reviewSuccess}</MassageBox>
                  )}
                  {reviewLoading && <LoadingBox />}
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, rating: e.target.value })
                    }
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Stars
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, title: e.target.value })
                    }
                    required
                  />
                  <textarea
                    placeholder="Share product quality, delivery and experience"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    rows="4"
                    required
                  />
                  <button type="submit" className="primary">
                    Submit Review
                  </button>
                </form>
              ) : (
                <MassageBox>Sign in to rate and review this product.</MassageBox>
              )}
            </div>

            <div className="detail-card">
              <p className="eyebrow">Specifications</p>
              <h2>Technical details</h2>
              <div className="detail-grid">
                {detailEntries.map(([key, value]) => (
                  <React.Fragment key={key}>
                    <span>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (text) =>
                        text.toUpperCase()
                      )}
                    </span>
                    <strong>{value}</strong>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {relatedProducts?.length > 0 ? (
            <section className="related-section">
              <div>
                <p className="eyebrow">Related</p>
                <h2>Similar products</h2>
              </div>
              <div className="raw center">
                <Productss Product={relatedProducts} />
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ProductScreen;
