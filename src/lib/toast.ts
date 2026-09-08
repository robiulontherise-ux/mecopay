export const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};