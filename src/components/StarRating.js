import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, onRatingChange, editable }) => {
  const [hover, setHover] = useState(null);

  const handleClick = (value) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => editable && setHover(value)}
            onMouseLeave={() => editable && setHover(null)}
            className={`bg-transparent border-none cursor-${editable ? 'pointer' : 'default'} text-2xl pr-1`}
          >
            <FaStar
              className={`${(hover || rating) >= value ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
