import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AddToCart, {
  loadCart,
  removeFromCart,
  resetCartStatus,
  updateCartItem,
} from "../redux/action/AddCartaction";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import SmartImage from "../componenet/SmartImage";

const CartScreen = (props) => {
  const productId = props.match.params.id;
  const quantity = props.location.search
    ? Number(new URLSearchParams(props.location.search).get("qty") || 1)
    : 1;

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const { loading, error, cartItems, summary, successMessage } = cart;

  useEffect(() => {
    if (!auth.user) {
      if (productId) {
        props.history.replace(
          `/signin?redirect=${encodeURIComponent(`/cart/${productId}?qty=${quantity}`)}`
        );
      }
      return;
    }

    if (productId) {
      dispatch(AddToCart(productId, quantity));
    } else {
      dispatch(loadCart());
    }
  }, [auth.user, dispatch, productId, props.history, quantity]);

  useEffect(() => {
    return () => {
      dispatch(resetCartStatus());
    };
  }, [dispatch]);

  if (!auth.user) {
    return (
      <div className="empty-state">
        <h1 className="page-title">Sign in required</h1>
        <p className="page-subtitle">
          Users cannot add products to cart or place orders without login/signup.
        </p>
        <Link
          className="primary-link"
          to={`/signin?redirect=${encodeURIComponent(props.location.pathname + props.location.search)}`}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {loading && <LoadingBox />}
      {error && <MassageBox variant="error">{error}</MassageBox>}
      {successMessage && <MassageBox variant="success">{successMessage}</MassageBox>}

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add products from the catalog to continue.</p>
          <Link to="/" className="primary-link">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items-section">
            <div className="section-summary section-summary-rich">
              <span>{summary.itemsCount} items selected</span>
              <span>Subtotal ₹{summary.subtotal.toLocaleString("en-IN")}</span>
              <span>Shipping ₹{summary.shipping.toLocaleString("en-IN")}</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.product} className="cart-item" id={`cart-item-${item.product}`}>
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  fallbackLabel={item.brand || item.itemName || item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <Link to={`/product/${item.product}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p>{item.category} / {item.subcategory}</p>
                  <span className="cart-item-price">
                    ₹{item.price ? item.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>

                <select
                  value={item.quantity}
                  onChange={(e) =>
                    dispatch(updateCartItem(item.product, Number(e.target.value)))
                  }
                >
                  {[...Array(Math.min(item.countInStock || 10, 10)).keys()].map(
                    (x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    )
                  )}
                </select>

                <button
                  className="btn-danger"
                  onClick={() => dispatch(removeFromCart(item.product))}
                  title="Remove item"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <p className="page-subtitle">
              Everything is visible before the payment sheet opens.
            </p>
            <div className="summary-row">
              <span className="label">Items ({summary.itemsCount})</span>
              <span className="value">
                ₹{summary.subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Shipping</span>
              <span className="value">₹{summary.shipping.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{summary.total.toLocaleString("en-IN")}</span>
            </div>
            <button
              className="primary block"
              style={{ marginTop: "1.6rem" }}
              onClick={() => props.history.push("/checkout")}
              id="checkout-btn"
              disabled={loading || cartItems.length === 0}
            >
              Continue to Address
            </button>
            <Link to="/catalog" className="secondary block cart-secondary-action">
              Add more products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
