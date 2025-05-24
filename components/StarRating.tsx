
import React, { useState } from 'react';
import { PRIMARY_COLOR_TEXT } from '../constants';

interface StarRatingProps {
  currentRating: number; // 0 if not rated
  onRate: (rating: number) => void;
  maxStars?: number;
  disabled?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; onHover?: () => void; onClick?: () => void; className?: string }> = ({ filled, onHover, onClick, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={`w-6 h-6 cursor-pointer transition-colors duration-150 ${filled ? PRIMARY_COLOR_TEXT : 'text-gray-600 hover:text-yellow-300'} ${className}`}
    onMouseEnter={onHover}
    onClick={onClick}
  >
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.33.98 4.726 4.236-2.285 4.236 2.285.98-4.726-3.423-3.33-4.753-.39L10.868 2.884zM10 12.43l-2.938 1.58.561-3.287-2.404-2.344 3.3-.285L10 5.236l1.481 3.158 3.3.285-2.404 2.344.561 3.287L10 12.43z" clipRule="evenodd" />
    {/* Simplified solid star when filled for better visual */}
     {filled && <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />}
  </svg>
);


const StarRating: React.FC<StarRatingProps> = ({ currentRating, onRate, maxStars = 5, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (rating: number) => {
    if (disabled) return;
    // If clicking the same rating, consider it as clearing the rating
    onRate(currentRating === rating ? 0 : rating);
  };

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={starValue}
            filled={(hoverRating || currentRating) >= starValue}
            onHover={!disabled ? () => setHoverRating(starValue) : undefined}
            onClick={!disabled ? () => handleRate(starValue) : undefined}
            className={disabled ? 'cursor-not-allowed opacity-70' : ''}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
    