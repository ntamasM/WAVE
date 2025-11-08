import React from 'react';
import './Checkbox.css';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-6 items-center">
        <label className="neon-checkbox">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <div className="neon-checkbox__frame">
            <div className="neon-checkbox__glow"></div>
            <div className="neon-checkbox__box"></div>
            <div className="neon-checkbox__check-container">
              <svg className="neon-checkbox__check" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="neon-checkbox__borders">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="neon-checkbox__particles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="neon-checkbox__rings">
              <div className="ring"></div>
              <div className="ring"></div>
              <div className="ring"></div>
            </div>
            <div className="neon-checkbox__sparks">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </label>
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm leading-6">
          {label && (
            <label htmlFor={id} className="form-label cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-secondary">{description}</p>}
        </div>
      )}
    </div>
  );
};
