import React from 'react';
import { SettingsForm } from './components/SettingsForm';
import { StatusCard } from './components/StatusCard';
import { Controls } from './components/Controls';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <img src="./FocusLock.png" alt="FocusLock" className="w-12 h-12 object-contain" />
            FocusLock
          </h1>
          <p className="text-gray-600 mt-2">Enforce focus through automated OS-level breaks</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Settings */}
          <div className="lg:col-span-1">
            <SettingsForm />
          </div>

          {/* Right Column: Status and Controls */}
          <div className="lg:col-span-2 space-y-6">
            <StatusCard />
            <Controls />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            FocusLock v1.0 • Minimize to tray to continue running in background
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
