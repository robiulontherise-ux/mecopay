/**
 * Dynamic Favicon and Document Title Synchronization helper
 */

export function updateFavicon(iconUrl: string | null | undefined): void {
  if (!iconUrl || typeof document === 'undefined') return;
  const linkRels = ['icon', 'shortcut icon', 'apple-touch-icon'];

  linkRels.forEach((rel) => {
    let link: HTMLLinkElement | null = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  });

  try {
    localStorage.setItem('cached_site_logo', iconUrl);
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function updateDocumentTitle(title: string | null | undefined, fallback = 'Store'): void {
  if (typeof document === 'undefined') return;
  const clean = title?.trim() || fallback;
  document.title = clean;

  try {
    localStorage.setItem('cached_site_name', clean);
  } catch (e) {
    // Ignore localStorage errors
  }
}
