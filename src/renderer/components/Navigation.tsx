import React from 'react';
import { FaHome, FaCog, FaInfoCircle, FaPalette } from 'react-icons/fa';

interface NavigationProps {
  currentPage: 'home' | 'settings' | 'customization' | 'about';
  onNavigate: (page: 'home' | 'settings' | 'customization' | 'about') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: FaHome },
    { id: 'settings' as const, label: 'Settings', icon: FaCog },
    { id: 'customization' as const, label: 'Customization', icon: FaPalette },
    { id: 'about' as const, label: 'About', icon: FaInfoCircle },
  ];

  return (
    <nav className="bg-white shadow-md rounded-lg mb-6">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all
                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}
                ${item.id === 'home' ? 'rounded-l-lg' : ''}
                ${item.id === 'about' ? 'rounded-r-lg' : ''}
              `}
            >
              <Icon className="text-xl" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
