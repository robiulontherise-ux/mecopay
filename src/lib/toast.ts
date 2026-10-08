export const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};