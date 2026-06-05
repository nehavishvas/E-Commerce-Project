import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";
import SmartImage from "../componenet/SmartImage";
import {
  clearTransactionDetail,
  fetchTransactionDetail,
} from "../redux/action/AddCartaction";

const formatTimestamp = (value) =>
  value ? new Date(value).toLocaleString() : "Not available";

const PaymentResultScreen = ({ match, location }) => {
  const dispatch = useDispatch();
  const { orderId } = match.params;
  const searchParams = new URLSearchParams(location.search);
  const fallbackReason = searchParams.get("reason") || "";
  const transactionState = useSelector((state) => state.orders);
  const transaction = transactionState.transactionDetail;
  const paymentStatus = transaction?.paymentDetail?.paymentStatus || "";
  const isSuccess = paymentStatus === "paid";

  useEffect(() => {
    dispatch(fetchTransactionDetail(orderId));

    return () => {
      dispatch(clearTransactionDetail());
    };
  }, [dispatch, orderId]);

  return (
    <div className="page-shell">
      {transactionState.transactionLoading ? (
        <LoadingBox />
      ) : transactionState.transactionError ? (
        <MassageBox variant="error">{transactionState.transactionError}</MassageBox>
      ) : !transaction ? (
        <MassageBox variant="error">Transaction detail is unavailable.</MassageBox>
      ) : (
        <div className="payment-result-stack">
          <section className={`payment-result-hero ${isSuccess ? "success" : "failed"}`}>
            <div>
              <span className="section-label">
                {isSuccess ? "Payment Success" : "Payment Update"}
              </span>
              <h1 className="page-title">
                {isSuccess
                  ? `Order #${transaction.order.id} was paid successfully.`
                  : `Order #${transaction.order.id} was not completed.`}
              </h1>
              <p className="page-subtitle">
                {isSuccess
                  ? "The transaction is confirmed in the backend and your order is now in the completed order flow."
                  : transaction.paymentDetail.failureReason ||
                    fallbackReason ||
                    "The payment did not complete. Review the transaction details below and retry from checkout if needed."}
              </p>
            </div>
            <div className="payment-result-actions">
              {isSuccess ? (
                <>
                  <Link to="/orders" className="primary-link">
                    View orders
                  </Link>
                  <Link to="/catalog" className="secondary">
                    Continue shopping
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/checkout" className="primary-link">
                    Retry payment
                  </Link>
                  <Link to="/cart" className="secondary">
                    Back to cart
                  </Link>
                </>
              )}
            </div>
          </section>

          <section className="checkout-layout">
            <div className="detail-card transaction-panel">
              <p className="eyebrow">Transaction Request</p>
              <div className="detail-grid">
                <span>Order ID</span>
                <strong>#{transaction.transactionRequest.orderId}</strong>
                <span>Requested</span>
                <strong>{formatTimestamp(transaction.transactionRequest.requestedAt)}</strong>
                <span>Gateway</span>
                <strong>{transaction.transactionRequest.gateway}</strong>
                <span>Gateway order</span>
                <strong>{transaction.transactionRequest.gatewayOrderId || "Pending"}</strong>
                <span>Receipt</span>
                <strong>{transaction.transactionRequest.receipt || "Pending"}</strong>
                <span>Amount</span>
                <strong>₹{transaction.order.summary.total.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="detail-card transaction-panel">
              <p className="eyebrow">Payment Detail</p>
              <div className="detail-grid">
                <span>Payment status</span>
                <strong>{transaction.paymentDetail.paymentStatus}</strong>
                <span>Order status</span>
                <strong>{transaction.paymentDetail.orderStatus}</strong>
                <span>Gateway payment</span>
                <strong>{transaction.paymentDetail.gatewayPaymentId || "Not assigned"}</strong>
                <span>Paid at</span>
                <strong>{formatTimestamp(transaction.paymentDetail.paidAt)}</strong>
                <span>Failed at</span>
                <strong>{formatTimestamp(transaction.paymentDetail.failedAt)}</strong>
                <span>Canceled at</span>
                <strong>{formatTimestamp(transaction.paymentDetail.canceledAt)}</strong>
                <span>Reason</span>
                <strong>{transaction.paymentDetail.failureReason || "None"}</strong>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <p className="eyebrow">Timeline</p>
            <div className="timeline-list">
              {transaction.timeline.map((entry) => (
                <div key={`${entry.label}-${entry.at || "na"}`} className={`timeline-entry ${entry.status}`}>
                  <strong>{entry.label}</strong>
                  <span>{formatTimestamp(entry.at)}</span>
                  <p>{entry.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-card">
            <p className="eyebrow">Items and Delivery</p>
            <div className="order-items-list transaction-item-list">
              {transaction.order.items.map((item) => (
                <div key={`${transaction.order.id}-${item.product}`} className="transaction-item-row">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fallbackLabel={item.name}
                    className="transaction-item-image"
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <strong>₹{item.subtotal.toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>
            <div className="detail-grid">
              <span>Deliver to</span>
              <strong>{transaction.order.shippingAddress.fullName}</strong>
              <span>Address</span>
              <strong>
                {transaction.order.shippingAddress.address}, {transaction.order.shippingAddress.city}
              </strong>
              <span>Postal code</span>
              <strong>{transaction.order.shippingAddress.postalCode}</strong>
              <span>Country</span>
              <strong>{transaction.order.shippingAddress.country}</strong>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PaymentResultScreen;
