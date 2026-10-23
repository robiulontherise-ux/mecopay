import React from 'react';
import { SiteSettings } from '../types';

interface FooterProps {
  siteSettings?: SiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings }) => {
  const buttons = siteSettings?.footer_buttons || [];
  const currentYear = new Date().getFullYear();
  const brandName = siteSettings?.site_name?.trim() || 'Store';

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-8 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 text-center">
        {buttons.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {buttons.map((btn, index) => {
              if (!btn.label) return null;
              const isHash = btn.url_or_page.startsWith('#');
              const isExternal = btn.url_or_page.startsWith('http');
              return (
                <a
                  key={index}
                  href={btn.url_or_page || '#'}
                  target={isExternal ? '_blank' : '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                >
                  {btn.label}
                </a>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>&copy; {currentYear} <strong>{brandName}</strong>. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
