import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bright-gray-50 dark:bg-bright-gray-900 flex flex-col transition-colors duration-200">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </div>

      {/* Footer */}
      <div className="border-t border-bright-gray-200 dark:border-bright-gray-700 bg-white dark:bg-bright-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-center text-sm text-bright-gray-500 dark:text-bright-gray-400">
            FocusLock v1.0 • Minimize to tray to continue running in background
          </p>
        </div>
      </div>
    </div>
  );
};

export default Layout;
