import React from "react";

export const MassageBox = (props) => {
  return (
    <div className={`alert alert-${props.variant || "info"}`}>
      {props.children}
    </div>
  );
};
