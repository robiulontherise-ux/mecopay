import React, { useState } from 'react';
import { Globe, UploadCloud, ArrowRight, Code } from 'lucide-react';
import MySiteApp from '../mysite/App';

export default function WebsiteBuilderHub({ user }) {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'no_code', 'upload'

  if (activeView === 'no_code') {
    return (
      <div className="h-[calc(100vh-100px)] overflow-y-auto w-full -mx-4 sm:mx-0 bg-slate-950 rounded-xl">
        <MySiteApp />
      </div>
    );
  }

  if (activeView === 'upload') {
    return (
      <div className="max-w-4xl">
        <button onClick={() => setActiveView('hub')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
          &larr; Back to Options
        </button>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
             <UploadCloud className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Custom Website</h2>
          <p className="text-slate-400 mb-8 max-w-xl">
            Upload your WordPress or Laravel source code (.zip). We will automatically provision an Oracle Cloud environment for your custom backend.
          </p>
          
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-blue-400 mb-4 transition-colors" />
            <p className="text-slate-300 font-medium mb-1">Click to browse or drag and drop</p>
            <p className="text-sm text-slate-500">Supports .zip files only (Max 500MB)</p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all">
              Upload & Deploy to Oracle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Website Builder Hub</h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          Choose how you want to build your platform. Use our lightning-fast No-Code builder hosted on Cloudflare, or upload your own custom backend infrastructure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: No-Code */}
        <div 
          onClick={() => setActiveView('no_code')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] transition-all group"
        >
          <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Build No-Code Website
          </h2>
          <p className="text-slate-400 mb-6 line-clamp-3">
            Create a professional storefront in minutes. Zero coding required. Hosted instantly on our global Cloudflare Edge network for infinite scalability.
          </p>
          <div className="flex items-center text-cyan-400 font-medium group-hover:gap-2 transition-all">
            Start Building <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Option 2: Upload */}
        <div 
          onClick={() => setActiveView('upload')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] transition-all group"
        >
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Code className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Upload Custom Backend</h2>
          <p className="text-slate-400 mb-6 line-clamp-3">
            Already have a WordPress or Laravel site? Upload your .zip file. We'll automatically route the domain to a dedicated Oracle Cloud VPS.
          </p>
          <div className="flex items-center text-blue-400 font-medium group-hover:gap-2 transition-all">
            Upload .zip File <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
