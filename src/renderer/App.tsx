import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Layout } from './components/Layout';
import { TitleBar } from './components/TitleBar';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Customization } from './pages/Customization';
import { About } from './pages/About';
import { useSettings } from './store/useSettings';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'customization' | 'about'>('home');
  const { settings } = useSettings();

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'settings':
        return <Settings />;
      case 'customization':
        return <Customization />;
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bright-gray-50 dark:bg-bright-gray-900 transition-colors duration-200">
      <TitleBar currentPage={currentPage} onNavigate={setCurrentPage} />
      <Layout>{renderPage()}</Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={settings.theme === 'dark' ? 'dark' : 'light'}
        className="toast-container"
      />
    </div>
  );
};

export default App;
