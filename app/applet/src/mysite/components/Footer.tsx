import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2">
        <span className="font-bold text-lg text-white tracking-tight">
          RSG SHOP
        </span>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} RSG SHOP. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
