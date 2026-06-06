import React from "react";
import { Link } from "react-router-dom";
import Rating from "./componenet/Rating";
import SmartImage from "./componenet/SmartImage";

const Productss = (props) => {
  const { Product } = props;

  return (
    <>
      {Product.map((prod) => {
        const quickDetails = Object.entries(prod.itemDetails || {}).slice(0, 2);
        return (
          <Link
            to={`/product/${prod.id}`}
            key={prod.id}
            className="card"
            id={`product-card-${prod.id}`}
          >
            <div className="card-image-wrapper">
              <SmartImage
                className="medium"
                src={prod.image}
                alt={prod.name}
                fallbackLabel={prod.brand || prod.itemName || prod.name}
              />
            </div>
            <div className="card-body">
              <span className="card-brand">{prod.brand}</span>
              <h2>{prod.name}</h2>
              <Rating rating={prod.rating} numReviews={prod.numReviews} />
              <div className="price">
                <span className="currency">₹</span>
                {prod.price ? prod.price.toLocaleString("en-IN") : "N/A"}
              </div>
              <div
                className={`stock-badge ${
                  prod.countInStock > 0 ? "in-stock" : "out-of-stock"
                }`}
              >
                <i
                  className={`fa-solid ${
                    prod.countInStock > 0 ? "fa-circle-check" : "fa-circle-xmark"
                  }`}
                ></i>
                {prod.countInStock > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export default Productss;
