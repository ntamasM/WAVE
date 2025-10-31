import { toast, ToastOptions } from 'react-toastify';

/**
 * Toast utility functions for consistent notifications across the app
 */

/**
 * Get the current theme from the document root
 */
const getCurrentTheme = (): 'light' | 'dark' => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const getDefaultOptions = (): ToastOptions => ({
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: getCurrentTheme(),
});

export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...getDefaultOptions(), ...options });
};

export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...getDefaultOptions(), ...options });
};

export const showWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...getDefaultOptions(), ...options });
};

export const showInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...getDefaultOptions(), ...options });
};

export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
) => {
  return toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    },
    { ...getDefaultOptions(), ...options }
  );
};
