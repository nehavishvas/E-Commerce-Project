import api from "../../api";
import constant from "../../constant/constant";

const getErrorMessage = (err) =>
  err.response && err.response.data.message
    ? err.response.data.message
    : err.message;

const closePaymentAttempt = async (orderId, status, reason) => {
  if (!orderId) {
    return;
  }

  try {
    await api.post(`/payments/${orderId}/cancel`, { status, reason });
  } catch (error) {
    // Keep checkout responsive even if attempt cleanup fails.
  }
};

const getPaymentOrderStatus = async (orderId) => {
  if (!orderId) {
    return null;
  }

  const { data } = await api.get(`/payments/${orderId}/status`);
  return data;
};

export const fetchTransactionDetail = (orderId) => async (dispatch) => {
  dispatch({ type: constant.TRANSACTION_DETAIL_REQUEST });

  try {
    const { data } = await api.get(`/transactions/${orderId}`);
    dispatch({ type: constant.TRANSACTION_DETAIL_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: constant.TRANSACTION_DETAIL_FAIL,
      payload: getErrorMessage(err),
    });
  }
};

export const clearTransactionDetail = () => ({
  type: constant.TRANSACTION_DETAIL_CLEAR,
});

const ensureRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const loadCart = () => async (dispatch) => {
  dispatch({ type: constant.CART_REQUEST });

  try {
    const { data } = await api.get("/cart");
    dispatch({ type: constant.CART_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: constant.CART_FAIL, payload: getErrorMessage(err) });
  }
};

const AddToCart = (productId, quantity) => async (dispatch) => {
  dispatch({ type: constant.CART_REQUEST });

  try {
    const { data } = await api.post("/cart/items", { productId, quantity });
    dispatch({ type: constant.CART_ADD_ITEM, payload: data });
  } catch (err) {
    dispatch({ type: constant.CART_FAIL, payload: getErrorMessage(err) });
  }
};

export const updateCartItem = (productId, quantity) => async (dispatch) => {
  dispatch({ type: constant.CART_REQUEST });

  try {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    dispatch({ type: constant.CART_ADD_ITEM, payload: data });
  } catch (err) {
    dispatch({ type: constant.CART_FAIL, payload: getErrorMessage(err) });
  }
};

export const removeFromCart = (productId) => async (dispatch) => {
  dispatch({ type: constant.CART_REQUEST });

  try {
    const { data } = await api.delete(`/cart/items/${productId}`);
    dispatch({ type: constant.CART_REMOVE_ITEM, payload: data });
  } catch (err) {
    dispatch({ type: constant.CART_FAIL, payload: getErrorMessage(err) });
  }
};

export const startPaymentCheckout =
  (shippingAddress, history) => async (dispatch) => {
    dispatch({ type: constant.PAYMENT_SESSION_REQUEST });
    let pendingOrderId = null;

    try {
      const [{ data: paymentConfig }, { data }] = await Promise.all([
        api.get("/payments/config"),
        api.post("/payments/razorpay-order", { shippingAddress }),
      ]);
      pendingOrderId = data.orderId;

      if (!paymentConfig.razorpayEnabled || !paymentConfig.keyId) {
        throw new Error("Razorpay is not configured on the server");
      }

      if (paymentConfig.provider === "mock") {
        const mockResponse = {
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: data.razorpayOrderId,
          razorpay_signature: "mock_signature",
        };
        const verification = await api.post("/payments/verify", mockResponse);
        dispatch({
          type: constant.PAYMENT_CONFIRM_SUCCESS,
          payload: verification.data,
        });
        history.replace(`/payment/success/${verification.data.id}`);
        return;
      }

      const scriptLoaded = await ensureRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout");
      }

      let paymentResolved = false;
      const options = {
        key: paymentConfig.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ShopZone",
        description: `Order #${data.orderId}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customer.name,
          email: data.customer.email,
        },
        notes: {
          internal_order_id: String(data.orderId),
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (response) => {
          paymentResolved = true;
          dispatch({ type: constant.PAYMENT_CONFIRM_REQUEST });

          try {
            const verification = await api.post("/payments/verify", response);
            dispatch({
              type: constant.PAYMENT_CONFIRM_SUCCESS,
              payload: verification.data,
            });
            history.replace(`/payment/success/${verification.data.id}`);
          } catch (err) {
            try {
              const paymentStatus = await getPaymentOrderStatus(data.orderId);

              if (paymentStatus?.order?.paymentStatus === "paid") {
                dispatch({
                  type: constant.PAYMENT_CONFIRM_SUCCESS,
                  payload: paymentStatus.order,
                });
                history.replace(`/payment/success/${paymentStatus.order.id}`);
                return;
              }

              if (paymentStatus?.order?.paymentFailureReason) {
                throw new Error(paymentStatus.order.paymentFailureReason);
              }
            } catch (statusError) {
              dispatch({
                type: constant.PAYMENT_CONFIRM_FAIL,
                payload: getErrorMessage(statusError),
              });
              history.replace(
                `/payment/failed/${data.orderId}?reason=${encodeURIComponent(
                  getErrorMessage(statusError)
                )}`
              );
              return;
            }

            dispatch({
              type: constant.PAYMENT_CONFIRM_FAIL,
              payload: getErrorMessage(err),
            });
            history.replace(
              `/payment/failed/${data.orderId}?reason=${encodeURIComponent(
                getErrorMessage(err)
              )}`
            );
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentResolved) {
              return;
            }

            paymentResolved = true;
            closePaymentAttempt(
              data.orderId,
              "canceled",
              "Customer closed the Razorpay checkout before completion"
            );
            dispatch({
              type: constant.PAYMENT_SESSION_FAIL,
              payload: "Payment was canceled. You can try again.",
            });
            history.replace(
              `/payment/failed/${data.orderId}?reason=${encodeURIComponent(
                "Payment was canceled. You can try again."
              )}`
            );
          },
        },
        retry: {
          enabled: true,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        if (paymentResolved) {
          return;
        }

        paymentResolved = true;
        const failureReason =
          response?.error?.description ||
          response?.error?.reason ||
          "Razorpay reported the payment as failed";

        closePaymentAttempt(data.orderId, "failed", failureReason);
        dispatch({
          type: constant.PAYMENT_SESSION_FAIL,
          payload: failureReason,
        });
        history.replace(
          `/payment/failed/${data.orderId}?reason=${encodeURIComponent(failureReason)}`
        );
      });
      paymentObject.open();
      dispatch({ type: constant.PAYMENT_SESSION_SUCCESS, payload: data });
    } catch (err) {
      const message = getErrorMessage(err);

      if (pendingOrderId) {
        closePaymentAttempt(
          pendingOrderId,
          "failed",
          message || "Unable to launch the Razorpay transaction"
        );
        history.replace(
          `/payment/failed/${pendingOrderId}?reason=${encodeURIComponent(message)}`
        );
      }

      dispatch({
        type: constant.PAYMENT_SESSION_FAIL,
        payload: message,
      });
    }
  };

export const listOrders = () => async (dispatch) => {
  dispatch({ type: constant.ORDER_LIST_REQUEST });

  try {
    const { data } = await api.get("/orders");
    dispatch({ type: constant.ORDER_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: constant.ORDER_LIST_FAIL, payload: getErrorMessage(err) });
  }
};

export const resetCartStatus = () => ({
  type: constant.CART_RESET_STATUS,
});

export default AddToCart;
