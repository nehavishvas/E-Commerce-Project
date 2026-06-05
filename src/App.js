import React, { useEffect } from "react";
import { Link, Route, Switch } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HomeScreen from "./screens/HomeScreen";
import SubcategoryScreen from "./screens/SubcategoryScreen";
import ItemScreen from "./screens/ItemScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import AuthScreen from "./screens/AuthScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrdersScreen from "./screens/OrdersScreen";
import PaymentResultScreen from "./screens/PaymentResultScreen";
import ProtectedRoute from "./componenet/ProtectedRoute";
import AdminRoute from "./componenet/AdminRoute";
import AdminCatalogScreen from "./screens/AdminCatalogScreen";
import { restoreSession, logout } from "./redux/action/authAction";
import { loadCart } from "./redux/action/AddCartaction";

function App() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (auth.user) {
      dispatch(loadCart());
    }
  }, [dispatch, auth.user]);

  return (
    <div className="grid_container">
      <header className="raw">
        <div>
          <Link className="brand" to="/catalog">
            ShopZone
          </Link>
        </div>
        <div className="header-right">
          <Link to="/catalog">Catalog</Link>
          <Link to="/cart" id="cart-link">
            Cart
            {cart.summary.itemsCount > 0 && (
              <span className="badge">{cart.summary.itemsCount}</span>
            )}
          </Link>
          {auth.user ? (
            <>
              {auth.user.isAdmin ? <Link to="/admin/catalog">Admin</Link> : null}
              <Link to="/orders">{auth.user.name}</Link>
              <button
                type="button"
                className="header-button"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/signin" id="signin-link">
              Sign In
            </Link>
          )}
          {!auth.user ? <Link to="/admin/login">Admin Login</Link> : null}
        </div>
      </header>

      <main>
        <Switch>
          <Route path="/admin/login" component={AuthScreen} exact />
          <Route path="/signin" component={AuthScreen} />
          <AdminRoute path="/admin/catalog" component={AdminCatalogScreen} />
          <ProtectedRoute path="/payment/success/:orderId" component={PaymentResultScreen} />
          <ProtectedRoute path="/payment/failed/:orderId" component={PaymentResultScreen} />
          <ProtectedRoute path="/checkout" component={CheckoutScreen} />
          <ProtectedRoute path="/orders" component={OrdersScreen} />
          <Route path="/cart/:id?" component={CartScreen} />
          <Route exact path="/product/:id" component={ProductScreen} />
          <Route
            path="/catalog/:categorySlug/:subcategorySlug"
            component={ItemScreen}
            exact
          />
          <Route
            path="/catalog/:categorySlug"
            component={SubcategoryScreen}
            exact
          />
          <Route path="/catalog" component={HomeScreen} exact />
          <Route path="/" component={HomeScreen} exact />
        </Switch>
      </main>

      <footer className="raw center footer-bar">
        © 2026 ShopZone
      </footer>
    </div>
  );
}

export default App;
