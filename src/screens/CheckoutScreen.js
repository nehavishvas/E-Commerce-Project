import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api";
import {
  loadCart,
  resetCartStatus,
  startPaymentCheckout,
} from "../redux/action/AddCartaction";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";

const CheckoutScreen = ({ history, location }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const orders = useSelector((state) => state.orders);
  const [paymentConfig, setPaymentConfig] = useState({
    loading: true,
    razorpayEnabled: false,
    keyId: null,
    currency: "INR",
    provider: "razorpay",
    error: "",
  });
  const [paymentNotice] = useState(
    new URLSearchParams(location.search).get("canceled")
      ? "Payment was canceled. You can review the cart and try again."
      : ""
  );

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    dispatch(loadCart());
    return () => dispatch(resetCartStatus());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadPaymentConfig = async () => {
      try {
        const { data } = await api.get("/payments/config");

        if (!isMounted) {
          return;
        }

        setPaymentConfig({
          loading: false,
          razorpayEnabled: Boolean(data.razorpayEnabled && data.keyId),
          keyId: data.keyId,
          currency: data.currency || "INR",
          provider: data.provider || "razorpay",
          error: "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPaymentConfig({
          loading: false,
          razorpayEnabled: false,
          keyId: null,
          currency: "INR",
          provider: "razorpay",
          error: "Unable to load payment configuration from the backend.",
        });
      }
    };

    loadPaymentConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(startPaymentCheckout(form, history));
  };

  if (cart.loading && cart.cartItems.length === 0) {
    return <LoadingBox />;
  }

  return (
    <div className="page-shell">
      <section className="flow-summary-banner">
        <div>
          <span className="section-label">Checkout</span>
          <h1 className="page-title">Finish the order with a guided payment handoff.</h1>
          <p className="page-subtitle">
            Enter shipping once, verify the order snapshot, and launch Razorpay
            from a clearer final step.
          </p>
        </div>
        <div className="checkout-steps">
          <span className="done">Cart</span>
          <span className="active">Address</span>
          <span>Payment</span>
          <span>Orders</span>
        </div>
      </section>

      <div className="checkout-layout">
        <div className="auth-card">
          <p className="eyebrow">Shipping Address</p>
          <h1>Where should we deliver?</h1>
          <p className="page-subtitle">
            Orders are finalized only after successful payment through Razorpay.
          </p>
          <form onSubmit={submitHandler} className="auth-form">
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Postal code"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            />
            {paymentNotice && <MassageBox>{paymentNotice}</MassageBox>}
            {paymentConfig.loading && <MassageBox>Checking Razorpay configuration...</MassageBox>}
            {!paymentConfig.loading && paymentConfig.razorpayEnabled && (
              <MassageBox>
                Secure payment is ready with {paymentConfig.provider} in{" "}
                {paymentConfig.currency}.
              </MassageBox>
            )}
            {paymentConfig.error && (
              <MassageBox variant="error">{paymentConfig.error}</MassageBox>
            )}
            {cart.activePayment && (
              <MassageBox>
                Payment window is active for order #{cart.activePayment.orderId}. Finish,
                cancel, or close that Razorpay session before starting another one.
              </MassageBox>
            )}
            {!paymentConfig.loading && !paymentConfig.razorpayEnabled && !paymentConfig.error && (
              <MassageBox variant="error">
                Razorpay is not configured on the backend. Start the backend from
                `backend/` so it can read `backend/.env`.
              </MassageBox>
            )}
            {(cart.error || orders.error) && (
              <MassageBox variant="error">{cart.error || orders.error}</MassageBox>
            )}
            {(cart.loading || orders.loading) && <LoadingBox />}
            <button
              type="submit"
              className="primary block"
              disabled={
                cart.cartItems.length === 0 ||
                paymentConfig.loading ||
                !paymentConfig.razorpayEnabled ||
                Boolean(cart.activePayment)
              }
            >
              Continue to Secure Payment
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Review Order</h2>
          <p className="page-subtitle">
            This summary stays visible while you enter shipping details.
          </p>
          {cart.cartItems.map((item) => (
            <div key={item.product} className="summary-row compact">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{item.subtotal.toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cart.summary.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>₹{cart.summary.shipping.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{cart.summary.total.toLocaleString("en-IN")}</span>
          </div>
          <div className="payment-badge">
            Payment provider: Razorpay
            {!paymentConfig.loading && paymentConfig.razorpayEnabled ? " ready" : " pending setup"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
