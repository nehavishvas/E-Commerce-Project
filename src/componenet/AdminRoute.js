import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ component: Component, ...rest }) => {
  const auth = useSelector((state) => state.auth);

  return (
    <Route
      {...rest}
      render={(props) =>
        auth.user ? (
          auth.user.isAdmin ? (
            <Component {...props} />
          ) : (
            <Redirect to="/catalog" />
          )
        ) : (
          <Redirect
            to={`/admin/login?redirect=${encodeURIComponent(
              props.location.pathname + props.location.search
            )}`}
          />
        )
      }
    />
  );
};

export default AdminRoute;
