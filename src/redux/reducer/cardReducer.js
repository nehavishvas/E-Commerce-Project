import constant from "../../constant/constant";

const initialState = {
  loading: false,
  activePayment: null,
  cartItems: [],
  summary: {
    itemsCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  },
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case constant.CART_REQUEST:
    case constant.PAYMENT_SESSION_REQUEST:
    case constant.PAYMENT_CONFIRM_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.CART_SUCCESS:
    case constant.CART_ADD_ITEM:
    case constant.CART_REMOVE_ITEM:
      return {
        ...state,
        loading: false,
        cartItems: action.payload.items,
        summary: action.payload.summary,
        successMessage: undefined,
      };
    case constant.PAYMENT_SESSION_SUCCESS:
      return {
        ...state,
        loading: false,
        activePayment: action.payload,
      };
    case constant.PAYMENT_CONFIRM_SUCCESS:
      return {
        ...state,
        loading: false,
        activePayment: null,
        cartItems: [],
        summary: {
          itemsCount: 0,
          subtotal: 0,
          shipping: 0,
          total: 0,
        },
        successMessage: `Order #${action.payload.id} created successfully`,
      };
    case constant.CART_FAIL:
    case constant.PAYMENT_SESSION_FAIL:
    case constant.PAYMENT_CONFIRM_FAIL:
      return { ...state, loading: false, activePayment: null, error: action.payload };
    case constant.AUTH_LOGOUT:
      return initialState;
    case constant.CART_RESET_STATUS:
      return {
        ...state,
        activePayment: state.loading ? state.activePayment : null,
        error: undefined,
        successMessage: undefined,
      };
    default:
      return state;
  }
};
