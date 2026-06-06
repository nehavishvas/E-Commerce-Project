import api from "../../api";
import constant from "../../constant/constant";

const getErrorMessage = (err) =>
  err.response && err.response.data.message
    ? err.response.data.message
    : err.message;

const persistSession = (payload) => {
  localStorage.setItem("shopzoneToken", payload.token);
  localStorage.setItem("shopzoneUser", JSON.stringify(payload.user));
};

export const hydrateOAuthSession = (token, user) => (dispatch) => {
  const payload = {
    token,
    user: typeof user === "string" ? JSON.parse(user) : user,
  };

  persistSession(payload);
  dispatch({ type: constant.AUTH_SUCCESS, payload });
};

export const restoreSession = () => async (dispatch) => {
  const token = localStorage.getItem("shopzoneToken");
  const user = localStorage.getItem("shopzoneUser");

  if (!token || !user) {
    return;
  }

  dispatch({
    type: constant.AUTH_SUCCESS,
    payload: {
      token,
      user: JSON.parse(user),
    },
  });

  try {
    const { data } = await api.get("/auth/me");
    dispatch({
      type: constant.AUTH_SUCCESS,
      payload: {
        token,
        user: data.user,
      },
    });
    localStorage.setItem("shopzoneUser", JSON.stringify(data.user));
  } catch (err) {
    dispatch(logout());
  }
};

export const login = (email, password) => async (dispatch) => {
  dispatch({ type: constant.AUTH_REQUEST });

  try {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data);
    dispatch({ type: constant.AUTH_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: constant.AUTH_FAIL, payload: getErrorMessage(err) });
  }
};

export const register = (name, email, password) => async (dispatch) => {
  dispatch({ type: constant.AUTH_REQUEST });

  try {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistSession(data);
    dispatch({ type: constant.AUTH_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: constant.AUTH_FAIL, payload: getErrorMessage(err) });
  }
};

export const loadGitHubAuthConfig = (redirect = "/") => async (dispatch) => {
  try {
    const { data } = await api.get("/auth/github/config", {
      params: { redirect },
    });
    dispatch({ type: constant.AUTH_GITHUB_CONFIG_SUCCESS, payload: data });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      dispatch({ type: constant.AUTH_GITHUB_CONFIG_SUCCESS, payload: { enabled: false } });
    } else {
      dispatch({ type: constant.AUTH_FAIL, payload: getErrorMessage(err) });
    }
  }
};

export const logout = () => {
  localStorage.removeItem("shopzoneToken");
  localStorage.removeItem("shopzoneUser");
  return { type: constant.AUTH_LOGOUT };
};
