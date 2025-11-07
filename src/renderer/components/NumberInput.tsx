import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { NumberInputProps } from '../../types/component.types';

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  placeholder = '0',
  id,
  className = '',
  label,
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string for user editing
    if (inputValue === '') {
      onChange(min);
      return;
    }

    const numValue = parseInt(inputValue, 10);

    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(max, Math.max(min, numValue));
      onChange(clampedValue);
    }
  };

  const handleBlur = () => {
    // Ensure value is within bounds on blur
    if (value < min) {
      onChange(min);
    } else if (value > max) {
      onChange(max);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={label ? `Decrement ${label}` : 'Decrement'}
        className="bg-bright-gray-100 dark:bg-bright-gray-700 
                   hover:bg-bright-gray-200 dark:hover:bg-bright-gray-600 
                   border border-bright-gray-300 dark:border-bright-gray-600 
                   rounded-l-lg p-3 h-11 
                   focus:ring-bright-gray-100 dark:focus:ring-bright-gray-700 
                   focus:ring-2 focus:outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        <FaMinus className="w-3 h-3 text-bright-gray-900 dark:text-white" />
      </button>

      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-label={label}
        className="bg-bright-gray-50 dark:bg-bright-gray-700 
                   border-x-0 border-y border-bright-gray-300 dark:border-bright-gray-600 
                   h-11 text-center text-bright-gray-900 dark:text-white 
                   text-sm 
                   focus:ring-vista-blue-500 focus:border-vista-blue-500 
                   dark:focus:ring-vista-blue-500 dark:focus:border-vista-blue-500 
                   block w-20 py-2.5 
                   placeholder-bright-gray-400 dark:placeholder-bright-gray-400
                   outline-none"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={label ? `Increment ${label}` : 'Increment'}
        className="bg-bright-gray-100 dark:bg-bright-gray-700 
                   hover:bg-bright-gray-200 dark:hover:bg-bright-gray-600 
                   border border-bright-gray-300 dark:border-bright-gray-600 
                   rounded-r-lg p-3 h-11 
                   focus:ring-bright-gray-100 dark:focus:ring-bright-gray-700 
                   focus:ring-2 focus:outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        <FaPlus className="w-3 h-3 text-bright-gray-900 dark:text-white" />
      </button>
    </div>
  );
};
