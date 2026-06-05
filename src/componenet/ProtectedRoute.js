import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const auth = useSelector((state) => state.auth);

  return (
    <Route
      {...rest}
      render={(props) =>
        auth.user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={`/signin?redirect=${encodeURIComponent(
              props.location.pathname + props.location.search
            )}`}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
