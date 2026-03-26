import React from 'react';

// Layout component types
export interface LayoutProps {
  children: React.ReactNode;
}

// Navigation component types
export type NavigationPage = 'home' | 'settings' | 'customization' | 'about';

export interface NavigationProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

// TitleBar component types
export interface TitleBarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

// NumberInput component types
export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  id?: string;
  className?: string;
  label?: string;
}

// Separator component types
export interface SeparatorProps {
  className?: string;
}

// Lock screen types
export interface LockData {
  lockDurationMs: number;
  showSkipButton: boolean;
  startTime: number;
}

export interface LockUpdateData {
  remainingMs: number;
}

// Checkbox component types
export interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

// Logo thumbnail types
export interface LogoThumbnailProps {
  logo: string;
  onSelect: (logo: string) => void;
}
