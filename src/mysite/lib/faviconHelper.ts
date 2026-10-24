/**
 * Dynamic Favicon and Document Title Synchronization helper
 */

export function updateFavicon(iconUrl: string | null | undefined): void {
  if (typeof document === 'undefined') return;

  // Purge any stale mother site favicon from client cache
  if (iconUrl && iconUrl.includes('cJk7YcMb')) {
    try {
      localStorage.removeItem('cached_site_logo');
      localStorage.removeItem('mysite_cached_logo');
    } catch (e) {}
    return;
  }

  const linkRels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  const finalUrl = iconUrl?.trim() || '';

  if (finalUrl) {
    linkRels.forEach((rel) => {
      let link: HTMLLinkElement | null = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = finalUrl;
    });

    try {
      localStorage.setItem('cached_site_logo', finalUrl);
      localStorage.setItem('mysite_cached_logo', finalUrl);
    } catch (e) {}
  }
}

export function updateDocumentTitle(title: string | null | undefined, fallback = ''): void {
  if (typeof document === 'undefined') return;
  const raw = title?.trim() || fallback?.trim() || '';

  // Purge stale 'Store' or 'MecoPay Store'
  if (raw === 'Store' || raw === 'MecoPay Store') {
    try {
      localStorage.removeItem('cached_site_name');
      localStorage.removeItem('mysite_cached_title');
    } catch (e) {}
    return;
  }

  if (raw) {
    document.title = raw;
    try {
      localStorage.setItem('cached_site_name', raw);
      localStorage.setItem('mysite_cached_title', raw);
    } catch (e) {}
  }
}
