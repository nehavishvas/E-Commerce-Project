import api from "../../api";
import constant from "../../constant/constant";

const getErrorMessage = (err) =>
  err.response && err.response.data.message
    ? err.response.data.message
    : err.message;

export const ListProduct = (filters = {}) => async (dispatch) => {
  dispatch({ type: constant.PRODUCT_LIST_REQUEST });

  try {
    const { data } = await api.get("/products", { params: filters });
    dispatch({ type: constant.PRODUCT_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: constant.PRODUCT_LIST_FAIL,
      payload: getErrorMessage(err),
    });
  }
};

export const detailProduct = (productId) => async (dispatch) => {
  dispatch({ type: constant.PRODUCT_DETAIL_REQUEST, payload: productId });

  try {
    const { data } = await api.get(`/products/${productId}`);
    dispatch({ type: constant.PRODUCT_DETAIL_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: constant.PRODUCT_DETAIL_FAIL,
      payload: getErrorMessage(err),
    });
  }
};

export const submitReview =
  (productId, reviewPayload) => async (dispatch) => {
    dispatch({ type: constant.REVIEW_CREATE_REQUEST });

    try {
      const { data } = await api.post(`/products/${productId}/reviews`, reviewPayload);
      dispatch({ type: constant.REVIEW_CREATE_SUCCESS, payload: data });
    } catch (err) {
      dispatch({
        type: constant.REVIEW_CREATE_FAIL,
        payload: getErrorMessage(err),
      });
    }
  };

export const loadCatalog = () => async (dispatch) => {
  dispatch({ type: constant.CATALOG_REQUEST });

  try {
    const { data } = await api.get("/catalog");
    dispatch({ type: constant.CATALOG_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: constant.CATALOG_FAIL,
      payload: getErrorMessage(err),
    });
  }
};
