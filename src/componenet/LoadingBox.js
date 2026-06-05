import React from "react";

export const LoadingBox = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <span className="loading-text">Loading products...</span>
    </div>
  );
};
