export interface ConfirmOptions {
  msg: string;
  requireType?: string;
  checkboxLabel?: string;
  defaultCheckbox?: boolean;
}

export const showConfirm = (options: string | ConfirmOptions): Promise<any> => {
  return new Promise((resolve) => {
    const handleConfirm = (e: any) => {
      window.removeEventListener('confirm-response', handleConfirm);
      resolve(e.detail);
    };
    window.addEventListener('confirm-response', handleConfirm);
    window.dispatchEvent(new CustomEvent('show-confirm', { detail: options }));
  });
};
