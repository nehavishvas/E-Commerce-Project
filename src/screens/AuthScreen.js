import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  hydrateOAuthSession,
  loadGitHubAuthConfig,
  login,
  register,
} from "../redux/action/authAction";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";

const AuthScreen = ({ history, location }) => {
  const isAdminLoginRoute = location.pathname === "/admin/login";
  const params = new URLSearchParams(location.search);
  const redirect =
    params.get("redirect") || (isAdminLoginRoute ? "/admin/catalog" : "/");
  const modeFromQuery =
    isAdminLoginRoute
      ? "login"
      : params.get("mode") === "register"
        ? "register"
        : "login";
  const oauthToken = params.get("oauthToken");
  const oauthUser = params.get("oauthUser");
  const oauthError = params.get("oauthError");

  const [mode, setMode] = useState(modeFromQuery);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    isAdminLoginRoute ? "admin@shopzone.com" : ""
  );
  const [password, setPassword] = useState(
    isAdminLoginRoute ? "admin123" : ""
  );

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.user) {
      if (auth.user.isAdmin && (!redirect || redirect === "/")) {
        history.replace("/admin/catalog");
        return;
      }

      history.replace(redirect);
    }
  }, [auth.user, history, redirect]);

  useEffect(() => {
    dispatch(loadGitHubAuthConfig(redirect));
  }, [dispatch, redirect]);

  useEffect(() => {
    if (isAdminLoginRoute) {
      setMode("login");
      setName("");
      setEmail("admin@shopzone.com");
      setPassword("admin123");
    }
  }, [isAdminLoginRoute]);

  useEffect(() => {
    if (oauthToken && oauthUser) {
      dispatch(hydrateOAuthSession(oauthToken, decodeURIComponent(oauthUser)));
    }
  }, [dispatch, oauthToken, oauthUser]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (mode === "register") {
      dispatch(register(name, email, password));
      return;
    }
    dispatch(login(email, password));
  };

  const applyPresetLogin = (nextEmail, nextPassword) => {
    setMode("login");
    setName("");
    setEmail(nextEmail);
    setPassword(nextPassword);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-wide">
        <div className="auth-intro-panel">
          <p className="eyebrow">
            {isAdminLoginRoute ? "Admin access" : "Authentication required"}
          </p>
          <h1>
            {isAdminLoginRoute
              ? "Admin login"
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </h1>
          <p className="page-subtitle">
            {isAdminLoginRoute
              ? "Use an admin or manager account to access catalog administration."
              : "Add to cart, pay securely, and track orders without losing your place in the flow."}
          </p>
          <div className="preset-login-panel">
            <button
              type="button"
              className="secondary block"
              onClick={() => applyPresetLogin("admin@shopzone.com", "admin123")}
            >
              Use Admin Login
            </button>
            <button
              type="button"
              className="secondary block"
              onClick={() => applyPresetLogin("manager@shopzone.com", "manager123")}
            >
              Use Manager Login
            </button>
            <button
              type="button"
              className="secondary block"
              onClick={() => applyPresetLogin("demo@shopzone.com", "demo123")}
            >
              Use Demo Login
            </button>
          </div>
          <div className="demo-box">
            Demo: demo@shopzone.com / demo123
            <br />
            Manager: manager@shopzone.com / manager123
            <br />
            Admin: admin@shopzone.com / admin123
          </div>
        </div>

        <div className="auth-form-panel">
          {auth.loading && <LoadingBox />}
          {auth.error && <MassageBox variant="error">{auth.error}</MassageBox>}
          {oauthError && <MassageBox variant="error">{oauthError}</MassageBox>}

          <form onSubmit={submitHandler} className="auth-form">
            {mode === "register" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength="6"
              required
            />
            <button type="submit" className="primary block">
              {mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </form>

          {!isAdminLoginRoute && (
            <>
              <div className="oauth-divider">or</div>
              <button
                type="button"
                className="secondary block oauth-button"
                disabled={!auth.githubConfig?.enabled}
                onClick={() => {
                  if (auth.githubConfig?.url) {
                    window.location.href = auth.githubConfig.url;
                  }
                }}
              >
                Continue with GitHub
              </button>

            </>
          )}

          {!isAdminLoginRoute && (
            <button
              type="button"
              className="text-button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
            >
              {mode === "register"
                ? "Already have an account? Sign in"
                : "New user? Create an account"}
            </button>
          )}

          {isAdminLoginRoute ? (
            <button
              type="button"
              className="text-button"
              onClick={() => history.push("/signin")}
            >
              Back to user sign in
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
