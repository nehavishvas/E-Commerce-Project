import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listOrders } from "../redux/action/AddCartaction";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";

const OrdersScreen = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(listOrders());
  }, [dispatch]);

  return (
    <div className="page-shell">
      <section className="flow-summary-banner">
        <div>
          <span className="section-label">Orders</span>
          <h1 className="page-title">See every completed step after payment.</h1>
          <p className="page-subtitle">
            Track order totals, payment state, and line items from one calm,
            readable history screen.
          </p>
        </div>
        <div className="checkout-steps">
          <span className="done">Cart</span>
          <span className="done">Address</span>
          <span className="done">Payment</span>
          <span className="active">Orders</span>
        </div>
      </section>
      {orders.loading ? (
        <LoadingBox />
      ) : orders.error ? (
        <MassageBox variant="error">{orders.error}</MassageBox>
      ) : orders.orders.length === 0 ? (
        <div className="empty-state">
          <p className="page-subtitle">No orders placed yet.</p>
        </div>
      ) : (
        <div className="orders-stack">
          <div className="section-summary section-summary-rich">
            <span>{orders.orders.length} orders placed</span>
            <span>
              Latest total ₹
              {orders.orders[0].summary.total.toLocaleString("en-IN")}
            </span>
            <span>
              Last update {new Date(orders.orders[0].createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="orders-grid">
            {orders.orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="summary-row">
                  <strong>Order #{order.id}</strong>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Status</span>
                  <span>{order.status}</span>
                </div>
                <div className="summary-row">
                  <span>Payment</span>
                  <span>
                    {order.paymentMethod} · {order.paymentStatus}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Items</span>
                  <span>{order.summary.itemsCount}</span>
                </div>
                <div className="summary-row">
                  <span>Total</span>
                  <span>₹{order.summary.total.toLocaleString("en-IN")}</span>
                </div>
                <Link to={`/payment/success/${order.id}`} className="secondary block">
                  View transaction
                </Link>
                <div className="order-items-list">
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.product}`}>
                      {item.name} x {item.quantity}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
