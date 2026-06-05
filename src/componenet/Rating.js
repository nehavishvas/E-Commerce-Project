import React from "react";

const Rating = ({ rating, numReviews }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <i key={i} className="fa-solid fa-star"></i>
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <i key={i} className="fa-solid fa-star-half-stroke"></i>
      );
    } else {
      stars.push(
        <i key={i} className="fa-solid fa-star empty"></i>
      );
    }
  }

  return (
    <div className="rating">
      {stars}
      {rating && <span className="rating-text">{rating}</span>}
      {numReviews && <span className="rating-text">({numReviews})</span>}
    </div>
  );
};

export default Rating;