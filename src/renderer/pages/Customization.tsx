import React, { useState, useEffect } from 'react';
import { useSettings } from '../store/useSettings';
import { updateSettings } from '../store/useSettings';
import { DEFAULT_CUSTOMIZATION } from '../../types/settings.types';
import type { CustomizationSettings } from '../../types/settings.types';
import { showSuccess, showError, showInfo } from '../lib/toast';
import { Separator } from '../components/Separator';
import {
  FaPalette,
  FaImage,
  FaFont,
  FaMousePointer,
  FaClock,
  FaGripLines,
  FaSave,
  FaTimes,
  FaFolder,
  FaUpload,
} from 'react-icons/fa';

// Separate component for logo thumbnail to avoid hooks in loops
const LogoThumbnail: React.FC<{ logo: string; onSelect: (logo: string) => void }> = ({ logo, onSelect }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  useEffect(() => {
    window.waveAPI.resolveLogoPath(logo).then(setResolvedUrl);
  }, [logo]);

  return (
    <button
      onClick={() => onSelect(logo)}
      className="aspect-square border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors p-2 bg-gray-50 dark:bg-gray-700 flex items-center justify-center"
    >
      {resolvedUrl && (
        <img
          src={resolvedUrl}
          alt="Logo"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </button>
  );
};

export const Customization: React.FC = () => {
  const { settings } = useSettings();
  const [localCustomization, setLocalCustomization] = useState<CustomizationSettings>(
    settings.customization || DEFAULT_CUSTOMIZATION
  );
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [availableLogos, setAvailableLogos] = useState<string[]>([]);
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string>('');

  useEffect(() => {
    if (settings.customization) {
      setLocalCustomization(settings.customization);
    }
  }, [settings.customization]);

  useEffect(() => {
    // Resolve logo path for preview
    if (localCustomization.logoUrl) {
      window.waveAPI.resolveLogoPath(localCustomization.logoUrl).then(setResolvedLogoUrl);
    }
  }, [localCustomization.logoUrl]);

  useEffect(() => {
    // Load available logos when modal opens
    if (isLogoModalOpen) {
      loadAvailableLogos();
    }
  }, [isLogoModalOpen]);

  const loadAvailableLogos = async () => {
    try {
      const logos = await window.waveAPI.getAvailableLogos();
      setAvailableLogos(logos);
    } catch (error) {
      console.error('Failed to load available logos:', error);
      showError('Failed to load available logos');
    }
  };

  const handleSelectLogoFromApp = (logo: string) => {
    handleDirectChange('logoUrl', logo);
    setIsLogoModalOpen(false);
    showSuccess('Logo selected successfully!');
  };

  const handleUploadLogo = async () => {
    try {
      const result = await window.waveAPI.uploadLogo();
      if (result.success && result.filename) {
        handleDirectChange('logoUrl', result.filename);
        setIsLogoModalOpen(false);
        showSuccess('Logo uploaded successfully!');
        // Reload available logos to include the new one
        await loadAvailableLogos();
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      showError('Failed to upload logo');
    }
  };

  const handleInputChange = (section: keyof CustomizationSettings, field: string, value: string) => {
    setLocalCustomization((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string>),
        [field]: value,
      },
    }));
  };

  const handleDirectChange = (field: keyof CustomizationSettings, value: string) => {
    setLocalCustomization((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings({ customization: localCustomization });
      showSuccess('Customization settings saved successfully!');
    } catch (error) {
      showError('Failed to save customization settings');
      console.error('Failed to save customization:', error);
    }
  };

  const handleReset = () => {
    setLocalCustomization(settings.customization || DEFAULT_CUSTOMIZATION);
    showInfo('Customization reset to saved values');
  };

  return (
    <div className="space-y-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bright-gray-50 dark:bg-bright-gray-900 border-b border-bright-gray-200 dark:border-bright-gray-700 pb-4 -mx-6 px-6 pt-2 flex items-center justify-between gap-4">
        <div>
          <h2 className="section-title">
            <FaPalette className="icon-primary" />
            Lock Screen Customization
          </h2>
          <p className="section-description">Customize the appearance of your break lock screen</p>
        </div>
        <div className="flex items-center gap-x-3 flex-shrink-0">
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset
          </button>
          <button onClick={handleSave} className="btn-primary">
            <FaSave className="-ml-0.5 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Background Gradient Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaGripLines className="icon-primary" />
              Background Gradient
            </h3>
            <p className="section-description">Customize the background colors</p>
          </div>
          <div className="section-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Color 1 (Start)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localCustomization.backgroundGradient.color1}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color1', e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomization.backgroundGradient.color1}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color1', e.target.value)}
                    className="flex-1 px-3 py-2 form-input"
                    placeholder="#73C8A9"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Color 2 (Middle)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localCustomization.backgroundGradient.color2}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color2', e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomization.backgroundGradient.color2}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color2', e.target.value)}
                    className="flex-1 px-3 py-2 form-input"
                    placeholder="#389477"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Color 3 (End)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localCustomization.backgroundGradient.color3}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color3', e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomization.backgroundGradient.color3}
                    onChange={(e) => handleInputChange('backgroundGradient', 'color3', e.target.value)}
                    className="flex-1 px-3 py-2 form-input"
                    placeholder="#373B44"
                  />
                </div>
              </div>
            </div>
            {/* Gradient Preview */}
            <div className="mt-4">
              <label className="form-label">Preview</label>
              <div
                className="w-full h-24 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${localCustomization.backgroundGradient.color1} 0%, ${localCustomization.backgroundGradient.color2} 50%, ${localCustomization.backgroundGradient.color3} 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Text Content Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaFont className="icon-primary" />
              Text Content
            </h3>
            <p className="section-description">Customize break screen text and colors</p>
          </div>
          <div className="section-body space-y-6">
            {/* Break Title */}
            <div>
              <label className="form-label">Break Title</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title Text</label>
                  <input
                    type="text"
                    value={localCustomization.breakTitle.text}
                    onChange={(e) => handleInputChange('breakTitle', 'text', e.target.value)}
                    className="w-full px-3 py-2 form-input"
                    placeholder="Break Time"
                  />
                </div>
                <div>
                  <label className="form-label">Title Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.breakTitle.color}
                      onChange={(e) => handleInputChange('breakTitle', 'color', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localCustomization.breakSubtitle.color}
                      onChange={(e) => handleInputChange('breakSubtitle', 'color', e.target.value)}
                      className="flex-1 px-3 py-2 form-input"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Break Subtitle */}
              <div>
                <label className="form-label">Break Subtitle</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Subtitle Text</label>
                    <input
                      type="text"
                      value={localCustomization.breakSubtitle.text}
                      onChange={(e) => handleInputChange('breakSubtitle', 'text', e.target.value)}
                      className="w-full px-3 py-2 form-input"
                      placeholder="Time to rest your eyes and stretch"
                    />
                  </div>
                  <div>
                    <label className="form-label">Subtitle Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localCustomization.breakSubtitle.color}
                        onChange={(e) => handleInputChange('breakSubtitle', 'color', e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localCustomization.breakSubtitle.color}
                        onChange={(e) => handleInputChange('breakSubtitle', 'color', e.target.value)}
                        className="flex-1 px-$2 py-2 form-input"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Logo Section */}
            <div>
              <label className="form-label">
                <FaImage className="inline icon-primary mr-2" />
                Break Logo
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Customize the break screen logo</p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={localCustomization.logoUrl}
                  onChange={(e) => handleDirectChange('logoUrl', e.target.value)}
                  className="flex-1 px-3 py-2 form-input"
                  placeholder="./Wave--icon.png"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="btn-secondary whitespace-nowrap flex items-center gap-2"
                >
                  <FaImage className="-ml-0.5 h-4 w-4" />
                  Choose Logo
                </button>
              </div>
              {localCustomization.logoUrl && resolvedLogoUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="w-24 h-24 border flex items-center justify-center border-none">
                    <img
                      src={resolvedLogoUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Skip Button Section */}
            <div>
              <label className="form-label">
                <FaMousePointer className="inline icon-primary mr-2" />
                Skip Button
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Customize the skip button appearance</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    value={localCustomization.skipButton.text}
                    onChange={(e) => handleInputChange('skipButton', 'text', e.target.value)}
                    className="w-full px-3 py-2 form-input"
                    placeholder="Skip Break"
                  />
                </div>
                <div>
                  <label className="form-label">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.skipButton.textColor}
                      onChange={(e) => handleInputChange('skipButton', 'textColor', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localCustomization.skipButton.textColor}
                      onChange={(e) => handleInputChange('skipButton', 'textColor', e.target.value)}
                      className="flex-1 px-3 py-2 form-input"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.skipButton.backgroundColor.replace(
                        'rgba(255, 255, 255, 0.25)',
                        '#FFFFFF'
                      )}
                      onChange={(e) => {
                        const hex = e.target.value;
                        // Convert hex to rgba with 25% opacity
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        handleInputChange('skipButton', 'backgroundColor', `rgba(${r}, ${g}, ${b}, 0.25)`);
                      }}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localCustomization.skipButton.backgroundColor}
                      onChange={(e) => handleInputChange('skipButton', 'backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 form-input"
                      placeholder="rgba(255, 255, 255, 0.25)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Timer & Progress Bar Section */}
            <div>
              <label className="form-label">
                <FaClock className="inline icon-primary mr-2" />
                Timer & Progress Bar
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Customize countdown and progress colors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Timer Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.timerColor}
                      onChange={(e) => handleDirectChange('timerColor', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localCustomization.timerColor}
                      onChange={(e) => handleDirectChange('timerColor', e.target.value)}
                      className="flex-1 px-3 py-2 form-input"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Progress Bar Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.progressBarColor}
                      onChange={(e) => handleDirectChange('progressBarColor', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localCustomization.progressBarColor}
                      onChange={(e) => handleDirectChange('progressBarColor', e.target.value)}
                      className="flex-1 px-3 py-2 form-input"
                      placeholder="#60A5FA"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Selection Modal */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                <FaImage className="inline mr-2 icon-primary" />
                Choose Logo
              </h3>
              <button
                onClick={() => setIsLogoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Upload from PC Section */}
                <div className="section-card">
                  <div className="section-header">
                    <h4 className="section-subtitle">
                      <FaUpload className="icon-primary" />
                      Upload from PC
                    </h4>
                    <p className="section-description">Choose an image file from your computer</p>
                  </div>
                  <div className="section-body">
                    <button onClick={handleUploadLogo} className="w-full btn-primary">
                      <FaUpload className="-ml-0.5 h-4 w-4" />
                      Choose File
                    </button>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supported formats: PNG, JPG, SVG</p>
                  </div>
                </div>

                {/* App Folder Section */}
                <div className="section-card">
                  <div className="section-header">
                    <h4 className="section-subtitle">
                      <FaFolder className="icon-primary" />
                      App Folder
                    </h4>
                    <p className="section-description">Select from previously uploaded images</p>
                  </div>
                  <div className="section-body">
                    {availableLogos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {availableLogos.map((logo, index) => (
                          <LogoThumbnail key={index} logo={logo} onSelect={handleSelectLogoFromApp} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No logos available. Upload one from your PC to get started.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setIsLogoModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customization;
