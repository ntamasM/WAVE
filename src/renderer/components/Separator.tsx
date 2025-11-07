import React from 'react';
import { SeparatorProps } from '../../types/component.types';

export const Separator: React.FC<SeparatorProps> = ({ className = '' }) => {
  return (
    <div
      className={`border-t border-gray-200 dark:border-gray-600 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
};

export default Separator;
